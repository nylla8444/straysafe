import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../../lib/mongoose';
import User from '../../../../../../../models/User';
import AdminAction from '../../../../../../../models/AdminAction';
import { withAdminAuth } from '../../../../../../../middleware/adminAuthMiddleware';

export async function PUT(request, context) {
    return withAdminAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Fix: Await params before accessing id
            const params = await context.params;
            const adopterId = params.id;
            const { status, notes } = await request.json();

            // Rest of your code remains the same
            const adopter = await User.findOne({ _id: adopterId, userType: 'adopter' });

            if (!adopter) {
                return NextResponse.json({
                    success: false,
                    error: 'Adopter not found'
                }, { status: 404 });
            }

            adopter.status = status;
            await adopter.save();

            // Log admin action
            const adminAction = new AdminAction({
                adminId: decoded.adminId,  // Changed from decoded._id to decoded.adminId
                adminName: decoded.firstName && decoded.lastName ?
                    decoded.firstName + ' ' + decoded.lastName : 'Admin User',
                userId: adopterId,
                userType: 'adopter',
                action: status === 'suspended' ? 'Suspended adopter account' : 'Reactivated adopter account',
                notes: notes
            });

            await adminAction.save();

            return NextResponse.json({
                success: true,
                message: `Adopter status updated to ${status}`
            });
        } catch (error) {
            console.error('Admin API Error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to update adopter status'
            }, { status: 500 });
        }
    });
}