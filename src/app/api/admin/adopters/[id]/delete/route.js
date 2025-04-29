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
            const adopterId = params.id;
            const { reason } = await request.json();

            // Find the adopter
            const adopter = await User.findOne({ _id: adopterId, userType: 'adopter' });

            if (!adopter) {
                return NextResponse.json({
                    success: false,
                    error: 'Adopter not found'
                }, { status: 404 });
            }

            // Store adopter info for the log
            const adopterInfo = {
                email: adopter.email,
                name: `${adopter.firstName} ${adopter.lastName}`
            };

            // Delete the adopter
            await User.deleteOne({ _id: adopterId });

            // Log admin action
            const adminAction = new AdminAction({
                adminId: decoded.adminId,
                adminName: decoded.firstName && decoded.lastName ?
                    decoded.firstName + ' ' + decoded.lastName : 'Admin User',
                userId: adopterId,
                userType: 'adopter',
                action: 'Deleted adopter account',
                notes: `Deleted adopter: ${adopterInfo.name} (${adopterInfo.email}). Reason: ${reason || 'No reason provided'}`
            });

            await adminAction.save();

            return NextResponse.json({
                success: true,
                message: 'Adopter deleted successfully'
            });
        } catch (error) {
            console.error('Admin API Error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete adopter'
            }, { status: 500 });
        }
    });
}