import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import Pet from '../../../../models/Pet';
import { withAuth } from '../../../../middleware/authMiddleware';
import { withCache } from '../../../../middleware/cacheMiddleware';

// Public endpoint with caching for improved performance
export async function GET(request) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            const { searchParams } = new URL(request.url);
            const status = searchParams.get('status');
            const specie = searchParams.get('specie');
            const organizationId = searchParams.get('organization');
            const searchTerm = searchParams.get('search')?.trim();
            const gender = searchParams.get('gender');

            // Pagination parameters
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '20');
            const skip = (page - 1) * limit;

            // Build filters object for MongoDB query
            const filters = {};

            // Basic filters
            if (status) filters.status = status;
            if (specie) filters.specie = specie;
            if (gender) filters.gender = gender;
            if (organizationId) filters.organization = organizationId;

            // Text search functionality
            if (searchTerm) {
                // Use $or operator to search across multiple fields
                filters.$or = [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { breed: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchTerm, 'i')] } }
                ];
            }

            // Execute count query and data query in parallel
            const [pets, totalCount] = await Promise.all([
                Pet.find(filters)
                    .populate('organization', 'organizationName location profileImage')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(), // lean() for read-only operations
                Pet.countDocuments(filters)
            ]);

            return NextResponse.json({
                success: true,
                pets,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching pets:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch pets'
            }, { status: 500 });
        }
    }, {
        duration: 5 * 60 * 1000,
        // Vary cache by query parameters
        varyByQuery: ['search', 'status', 'specie', 'gender', 'organization', 'page', 'limit']
    });
}

// POST route remains the same - no caching for write operations
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get organization directly from decoded token
            const userId = decoded.userId;
            const organization = await User.findById(userId);

            if (!organization || organization.userType !== 'organization') {
                return NextResponse.json({ error: 'Only organizations can post pets' }, { status: 403 });
            }

            if (!organization.isVerified) {
                return NextResponse.json({ error: 'Organization must be verified to post pets' }, { status: 403 });
            }

            const petData = await request.json();

            // organization ID to the pet data
            petData.organization = organization._id;

            // Validate minimum images
            if (!petData.img_arr || petData.img_arr.length < 1) {
                return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
            }

            const newPet = new Pet(petData);
            await newPet.save();

            return NextResponse.json({
                success: true,
                message: 'Pet created successfully',
                pet: newPet
            }, { status: 201 });

        } catch (error) {
            console.error('Error creating pet:', error);
            return NextResponse.json({
                success: false,
                error: error.message || 'Failed to create pet'
            }, { status: 500 });
        }
    });
}