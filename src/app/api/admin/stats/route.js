import { NextResponse } from 'next/server';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';
import { withCache } from '../../../../../middleware/cacheMiddleware';
import { withAdminAuth } from '../../../../../middleware/adminAuthMiddleware';

export async function GET(request) {
    return withAdminAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Use more efficient queries with single database call
            const [
                totalUsers,
                adopters,
                adoptersActive,
                adoptersSuspended,
                organizations,
                pendingOrganizations,
                verifiedOrganizations,
                rejectedOrganizations
            ] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ userType: 'adopter' }),
                User.countDocuments({ userType: 'adopter', status: { $ne: 'suspended' } }),
                User.countDocuments({ userType: 'adopter', status: 'suspended' }),
                User.countDocuments({ userType: 'organization' }),
                User.countDocuments({
                    userType: 'organization',
                    verificationStatus: 'pending',
                    isVerified: false
                }),
                User.countDocuments({
                    userType: 'organization',
                    isVerified: true
                }),
                User.countDocuments({
                    userType: 'organization',
                    verificationStatus: 'rejected',
                    isVerified: false
                })
            ]);

            // Cache control headers to ensure fresh data
            const headers = new Headers();
            headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
            headers.append('Pragma', 'no-cache');
            headers.append('Expires', '0');

            return NextResponse.json({
                totalUsers,
                adopters,
                adoptersActive,
                adoptersSuspended,
                organizations,
                pendingOrganizations,
                verifiedOrganizations,  // Added this to the response
                rejectedOrganizations   // Added this to the response
            }, { headers });

        } catch (error) {
            console.error('Admin stats error:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch stats'
            }, { status: 500 });
        }
    });
}