import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../../lib/mongoose';
import User from '../../../../../../../models/User';
import VerificationHistory from '../../../../../../../models/VerificationHistory';
import { withAdminAuth } from '../../../../../../../middleware/adminAuthMiddleware';

export async function PUT(request, { params }) {
    return withAdminAuth(request, async (req, decoded) => {
        try {
            // Get request body
            const { status, notes } = await request.json();

            // Validate status
            if (!['verified', 'followup', 'rejected', 'pending'].includes(status)) {
                return NextResponse.json(
                    { error: 'Invalid status value' },
                    { status: 400 }
                );
            }

            // Connect to database
            await connectionToDB();

            // Get organization ID from route parameter
            const resolvedParams = await Promise.resolve(params);
            const organizationId = resolvedParams.id;

            // Find the organization
            const organization = await User.findById(organizationId);

            if (!organization) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
            }

            // Record verification history
            await VerificationHistory.create({
                organization: organizationId,
                admin: decoded.adminId, // Use admin ID from token
                previousStatus: organization.verificationStatus,
                newStatus: status,
                notes: notes || '',
                timestamp: new Date()
            });

            // Update organization verification status
            const updatedOrg = await User.findByIdAndUpdate(
                organizationId,
                {
                    verificationStatus: status,
                    verificationNotes: notes || '',
                    isVerified: status === 'verified',
                    updatedAt: new Date()
                },
                { new: true }
            );

            // Return success response with updated organization
            return NextResponse.json({
                success: true,
                organization: {
                    _id: updatedOrg._id,
                    organizationName: updatedOrg.organizationName,
                    verificationStatus: updatedOrg.verificationStatus,
                    isVerified: updatedOrg.isVerified,
                    verificationNotes: updatedOrg.verificationNotes
                }
            });

        } catch (error) {
            console.error('Error in organization verification:', error);
            return NextResponse.json({
                error: 'Failed to update verification status'
            }, { status: 500 });
        }
    });
}