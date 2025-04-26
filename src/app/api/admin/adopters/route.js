import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';
import { withAdminAuth } from '../../../../../middleware/adminAuthMiddleware';

export async function GET(request) {
    return withAdminAuth(request, async (req, adminUser) => {
        try {
            await connectionToDB();

            const url = new URL(request.url);
            const status = url.searchParams.get('status');

            // Build query based on status filter
            const query = { userType: 'adopter' };

            if (status === 'active') {
                query.status = { $ne: 'suspended' };
            } else if (status === 'suspended') {
                query.status = 'suspended';
            }

            const adopters = await User.find(query).sort({ createdAt: -1 }).lean();

            return NextResponse.json({
                success: true,
                adopters
            });
        } catch (error) {
            console.error('Admin API Error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch adopters'
            }, { status: 500 });
        }
    });
}