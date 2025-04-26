import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Pet from '../../../../../models/Pet';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { withCache } from '../../../../../middleware/cacheMiddleware';

// Public endpoint with caching for individual pet details
export async function GET(request, { params }) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            const resolvedParams = await Promise.resolve(params);
            const petId = resolvedParams.id;

            const pet = await Pet.findById(petId)
                .populate('organization', 'organizationName location profileImage contactNumber email');

            if (!pet) {
                return NextResponse.json({
                    success: false,
                    error: 'Pet not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                pet
            });

        } catch (error) {
            console.error('Error fetching pet details:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch pet details'
            }, { status: 500 });
        }
    }, { duration: 15 * 1000 }); // 15 seconds cache - pet details may change frequently
}

// Update pet - requires auth (no caching needed for write operations)
export async function PUT(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const resolvedParams = await Promise.resolve(params);
            const petId = resolvedParams.id;

            // Find the pet
            const pet = await Pet.findById(petId);

            if (!pet) {
                return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
            }

            // Check ownership - simplified with decoded token
            if (pet.organization.toString() !== decoded.userId) {
                return NextResponse.json({ error: 'Not authorized to update this pet' }, { status: 403 });
            }

            const updateData = await request.json();

            // Don't allow changing organization
            delete updateData.organization;
            delete updateData.pet_id;

            // Ensure at least one image remains
            if (updateData.img_arr && updateData.img_arr.length < 1) {
                return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
            }

            const updatedPet = await Pet.findByIdAndUpdate(
                petId,
                updateData,
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: 'Pet updated successfully',
                pet: updatedPet
            });

        } catch (error) {
            console.error('Error updating pet:', error);
            return NextResponse.json({
                success: false,
                error: error.message || 'Failed to update pet'
            }, { status: 500 });
        }
    });
}

// Delete pet - requires auth (no caching needed for write operations)
export async function DELETE(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const resolvedParams = await Promise.resolve(params);
            const petId = resolvedParams.id;

            // Find the pet
            const pet = await Pet.findById(petId);

            if (!pet) {
                return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
            }

            // Check ownership using decoded token
            if (pet.organization.toString() !== decoded.userId) {
                return NextResponse.json({ error: 'Not authorized to delete this pet' }, { status: 403 });
            }

            await Pet.findByIdAndDelete(petId);

            return NextResponse.json({
                success: true,
                message: 'Pet deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting pet:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to delete pet'
            }, { status: 500 });
        }
    });
}