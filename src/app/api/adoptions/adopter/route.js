import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import AdoptionApplication from '../../../../../models/AdoptionApplication';
import Pet from '../../../../../models/Pet';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get the user from the token
            const user = await User.findById(decoded.userId);

            if (!user || user.userType !== 'adopter') {
                return NextResponse.json({
                    success: false,
                    error: 'Only adopters can view adoption applications'
                }, { status: 403 });
            }

            // Get applications by the current adopter
            const applications = await AdoptionApplication.find({
                adopterId: decoded.userId
            })
                .populate('petId')
                .populate({
                    path: 'organizationId',
                    select: 'organizationName email contactNumber'
                })
                .sort({ createdAt: -1 })
                .exec();

            return NextResponse.json({
                success: true,
                applications
            });

        } catch (error) {
            console.error('Error fetching adopter applications:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch applications'
            }, { status: 500 });
        }
    });
}