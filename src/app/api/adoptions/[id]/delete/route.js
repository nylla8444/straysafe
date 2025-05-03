import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../lib/mongoose';
import AdoptionApplication from '../../../../../../models/AdoptionApplication';
import { withAuth } from '../../../../../../middleware/authMiddleware';

export async function DELETE(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            const { id } = await params;
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

            // Check if the requesting user is the organization that received the application
            if (application.organizationId.toString() !== decoded.userId) {
                return NextResponse.json({
                    success: false,
                    error: 'Not authorized to delete this application'
                }, { status: 403 });
            }

            // Check if application is rejected (only rejected applications can be deleted)
            if (application.status !== 'rejected') {
                return NextResponse.json({
                    success: false,
                    error: 'Only rejected applications can be deleted'
                }, { status: 400 });
            }

            // Delete the application
            await AdoptionApplication.findByIdAndDelete(application._id);

            return NextResponse.json({
                success: true,
                message: 'Application deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting application:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete application'
            }, { status: 500 });
        }
    });
}