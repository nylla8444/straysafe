import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { withCache } from '../../../../middleware/cacheMiddleware';

export async function GET(request) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            const { searchParams } = new URL(request.url);
            const searchTerm = searchParams.get('search')?.trim();

            // Pagination parameters
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '20');
            const skip = (page - 1) * limit;

            // Build filters object for MongoDB query
            const filters = {
                userType: 'organization',
                isVerified: true,
                verificationStatus: 'verified'
            };

            // Search functionality
            if (searchTerm) {
                filters.$or = [
                    { organizationName: { $regex: searchTerm, $options: 'i' } },
                    { location: { $regex: searchTerm, $options: 'i' } },
                    { city: { $regex: searchTerm, $options: 'i' } },
                    { province: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } }
                ];
            }

            // Execute count query and data query in parallel
            const [organizations, totalCount] = await Promise.all([
                User.find(
                    filters,
                    {
                        _id: 1,
                        organizationName: 1,
                        email: 1,
                        contactNumber: 1,
                        city: 1,
                        province: 1,
                        location: 1,
                        profileImage: 1,
                        establishedYear: 1,
                        isVerified: 1
                    }
                )
                    .sort({ organizationName: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                User.countDocuments(filters)
            ]);

            return NextResponse.json({
                success: true,
                organizations,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching organizations:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch organizations'
            }, { status: 500 });
        }
    }, {
        duration: 5 * 60 * 1000, // 5 minutes cache
        varyByQuery: ['search', 'page', 'limit']
    });
}