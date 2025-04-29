import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../../lib/mongoose';
import User from '../../../../../../../models/User';
import AdminAction from '../../../../../../../models/AdminAction';
import { withAdminAuth } from '../../../../../../../middleware/adminAuthMiddleware';

export async function DELETE(request, context) {
    return withAdminAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const params = await context.params;
            const organizationId = params.id;
            const { reason } = await request.json();

            // Find the organization
            const organization = await User.findOne({ _id: organizationId, userType: 'organization' });

            if (!organization) {
                return NextResponse.json({
                    success: false,
                    error: 'Organization not found'
                }, { status: 404 });
            }

            // Store organization info for the log
            const orgInfo = {
                email: organization.email,
                name: organization.organizationName
            };

            // Delete the organization
            await User.deleteOne({ _id: organizationId });

            // Log admin action
            const adminAction = new AdminAction({
                adminId: decoded.adminId,
                adminName: decoded.firstName && decoded.lastName ?
                    decoded.firstName + ' ' + decoded.lastName : 'Admin User',
                userId: organizationId,
                userType: 'organization',
                action: 'Deleted organization account',
                notes: `Deleted organization: ${orgInfo.name} (${orgInfo.email}). Reason: ${reason || 'No reason provided'}`
            });

            await adminAction.save();

            return NextResponse.json({
                success: true,
                message: 'Organization deleted successfully'
            });
        } catch (error) {
            console.error('Admin API Error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete organization'
            }, { status: 500 });
        }
    });
}