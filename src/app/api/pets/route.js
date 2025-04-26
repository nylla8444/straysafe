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
            // Add pagination parameters
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '20');
            const skip = (page - 1) * limit;

            const filters = {};
            if (status) filters.status = status;
            if (specie) filters.specie = specie;
            if (organizationId) filters.organization = organizationId;

            // Execute count query and data query in parallel
            const [pets, totalCount] = await Promise.all([
                Pet.find(filters)
                    .populate('organization', 'organizationName location profileImage')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(), // Add lean() for read-only operations
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
        duration: 30 * 1000
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

            // Add organization ID to the pet data
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