import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { withCache } from '../../../../middleware/cacheMiddleware';

export async function GET(request) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            // You can't mix inclusion and exclusion in MongoDB projections
            // Choose inclusion approach (safer) by explicitly listing fields to return
            const organizations = await User.find(
                {
                    userType: 'organization',
                    isVerified: true,
                    verificationStatus: 'verified'
                },
                {
                    // Explicitly include only the fields you need
                    _id: 1,
                    organizationName: 1,
                    email: 1,
                    contactNumber: 1,
                    city: 1,
                    province: 1,
                    location: 1,
                    profileImage: 1,
                    establishedYear: 1,
                    // password and verificationDocument will be automatically excluded
                }
            ).lean(); // Add lean() for better performance

            return NextResponse.json({
                success: true,
                organizations
            });
        } catch (error) {
            console.error('Error fetching organizations:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch organizations'
            }, { status: 500 });
        }
    }, { duration: 60 * 1000 }); // Cache for 60 seconds
}