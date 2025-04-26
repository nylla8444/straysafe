import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../../lib/mongoose';
import AdminAction from '../../../../../../../models/AdminAction';
import { withAdminAuth } from '../../../../../../../middleware/adminAuthMiddleware';

export async function GET(request, context) {
    return withAdminAuth(request, async (req, adminUser) => {
        try {
            await connectionToDB();

            // Fix: Await params before accessing id
            const params = await context.params;
            const adopterId = params.id;

            // Get all admin actions for this adopter
            const history = await AdminAction.find({
                userId: adopterId,
                userType: 'adopter'
            }).sort({ timestamp: -1 });

            return NextResponse.json({
                success: true,
                history
            });
        } catch (error) {
            console.error('Admin API Error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch adopter history'
            }, { status: 500 });
        }
    });
}