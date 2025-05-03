import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import AdoptionApplication from '../../../../../models/AdoptionApplication';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get the organization details using the decoded token
            const organization = await User.findOne({
                _id: decoded.userId,
                userType: 'organization'
            });

            if (!organization) {
                return NextResponse.json({
                    success: false,
                    error: 'User not found or not an organization'
                }, { status: 404 });
            }

            if (!organization.isVerified) {
                return NextResponse.json({
                    success: false,
                    error: 'Only verified organizations can view applications'
                }, { status: 403 });
            }

            // Get applications for this organization
            const applications = await AdoptionApplication.find({
                organizationId: organization._id
            })
                .populate('petId')
                .populate({
                    path: 'adopterId',
                    select: 'firstName lastName email contactNumber location'
                })
                .sort({ createdAt: -1 })
                .exec();

            return NextResponse.json({
                success: true,
                applications
            });

        } catch (error) {
            console.error('Error fetching organization applications:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch applications'
            }, { status: 500 });
        }
    });
}