import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import AdoptionApplication from '../../../../../models/AdoptionApplication';
import User from '../../../../../models/User';
import Pet from '../../../../../models/Pet';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            const { id } = await params;

            await connectionToDB();

            const application = await AdoptionApplication.findOne({
                applicationId: parseInt(id)
            })
                .populate('petId')
                .populate({
                    path: 'adopterId',
                    select: 'firstName lastName email contactNumber location'
                })
                .populate({
                    path: 'organizationId',
                    select: 'organizationName email contactNumber'
                });

            if (!application) {
                return NextResponse.json({
                    success: false,
                    error: 'Application not found'
                }, { status: 404 });
            }

            // Security check - only allow adopter or organization to view
            const user = await User.findById(decoded.userId);

            if (!user) {
                return NextResponse.json({
                    success: false,
                    error: 'User not found'
                }, { status: 404 });
            }

            const isAdopter = user.userType === 'adopter' &&
                user._id.toString() === application.adopterId._id.toString();
            const isOrganization = user.userType === 'organization' &&
                user._id.toString() === application.organizationId._id.toString();

            if (!isAdopter && !isOrganization) {
                return NextResponse.json({
                    success: false,
                    error: 'Not authorized to view this application'
                }, { status: 403 });
            }

            return NextResponse.json({
                success: true,
                application
            });

        } catch (error) {
            console.error('Error fetching application:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch application details'
            }, { status: 500 });
        }
    });
}

export async function PUT(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            const { id } = await params;
            const data = await request.json();

            await connectionToDB();

            // Find the application
            const application = await AdoptionApplication.findOne({
                applicationId: parseInt(id)
            });

            if (!application) {
                return NextResponse.json({
                    success: false,
                    error: 'Application not found'
                }, { status: 404 });
            }

            // Security check - only organization can update
            const user = await User.findById(decoded.userId);

            if (!user || user.userType !== 'organization' ||
                user._id.toString() !== application.organizationId.toString()) {
                return NextResponse.json({
                    success: false,
                    error: 'Not authorized to update this application'
                }, { status: 403 });
            }

            // Update application status
            if (data.status) {
                application.status = data.status;
            }

            if (data.organizationNotes) {
                application.organizationNotes = data.organizationNotes;
            }

            if (data.rejectionReason && data.status === 'rejected') {
                application.rejectionReason = data.rejectionReason;
            }

            application.reviewedBy = `${user.organizationName}`;

            await application.save();

            // If approved, update the pet status to adopted
            if (data.status === 'approved') {
                const pet = await Pet.findById(application.petId);
                if (pet) {
                    pet.status = 'adopted';
                    await pet.save();

                    // Reject any other pending applications for this pet
                    await AdoptionApplication.updateMany(
                        {
                            petId: application.petId,
                            _id: { $ne: application._id },
                            status: { $in: ['pending', 'reviewing'] }
                        },
                        {
                            status: 'rejected',
                            rejectionReason: 'This pet has been adopted by another applicant.',
                            reviewedBy: user.organizationName
                        }
                    );
                }
            }

            return NextResponse.json({
                success: true,
                message: `Application status updated to ${data.status}`,
                application
            });

        } catch (error) {
            console.error('Error updating application:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update application'
            }, { status: 500 });
        }
    });
}