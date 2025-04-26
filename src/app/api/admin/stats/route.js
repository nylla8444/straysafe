import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';
import { withCache } from '../../../../../middleware/cacheMiddleware';
import { withAdminAuth } from '../../../../../middleware/adminAuthMiddleware';

export async function GET(request) {
    return withAdminAuth(request, async (req, decoded) => {
        return withCache(req, async () => {
            try {
                await connectionToDB();

                // Get stats
                const totalUsers = await User.countDocuments();
                const adopters = await User.countDocuments({ userType: 'adopter' });
                const organizations = await User.countDocuments({ userType: 'organization' });
                const pendingOrganizations = await User.countDocuments({
                    userType: 'organization',
                    verificationStatus: 'pending',
                    isVerified: false
                });

                return NextResponse.json({
                    success: true,
                    totalUsers,
                    adopters,
                    organizations,
                    pendingOrganizations
                });
            } catch (error) {
                console.error('Admin stats error:', error);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to fetch stats'
                }, { status: 500 });
            }
        }, { duration: 120 * 1000 }); // 2 minutes cache - stats change infrequently
    });
}