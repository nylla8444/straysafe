import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';
import { withCache } from '../../../../../middleware/cacheMiddleware';

export async function GET(request, { params }) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            const resolvedParams = await Promise.resolve(params);
            const organizationId = resolvedParams.id;

            // Instead of using findOne with projection exclusions, use findById with specific includes
            const organization = await User.findById(organizationId)
                .select('organizationName email contactNumber location profileImage description isVerified donationSettings verificationStatus city province')
                .where({
                    userType: 'organization',
                    isVerified: true,
                    verificationStatus: 'verified'
                })
                .lean();

            if (!organization) {
                return NextResponse.json({
                    success: false,
                    error: 'Organization not found or not verified'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                organization
            });
        } catch (error) {
            console.error('Error fetching organization:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch organization'
            }, { status: 500 });
        }
    }, { duration: 60 * 1000 }); // 60 seconds cache
}