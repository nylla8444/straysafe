import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import Favorites from '../../../../models/Favorites';
import Pet from '../../../../models/Pet';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get user's favorites
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'adopter') {
                return NextResponse.json({
                    success: false,
                    message: 'Only adopters can have favorites'
                }, { status: 403 });
            }

            await connectionToDB();

            // Find user's favorites document
            let userFavorites = await Favorites.findOne({ userId: decoded.userId });

            if (!userFavorites) {
                // Create a new empty favorites document for the user
                userFavorites = new Favorites({
                    userId: decoded.userId,
                    pets: []
                });
                await userFavorites.save();
                return NextResponse.json({
                    success: true,
                    favorites: []
                });
            }

            // Use lean() for better performance
            const populatedFavorites = await Favorites.findOne({ userId: decoded.userId })
                .populate({
                    path: 'pets',
                    select: 'name breed specie img_arr status gender age adoptionFee tags',
                    populate: {
                        path: 'organization',
                        select: 'organizationName profileImage'
                    }
                })
                .lean();

            return NextResponse.json({
                success: true,
                favorites: populatedFavorites?.pets || []
            });
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch favorites'
            }, { status: 500 });
        }
    });
}

// Add or remove a pet from favorites
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'adopter') {
                return NextResponse.json({
                    success: false,
                    message: 'Only adopters can manage favorites'
                }, { status: 403 });
            }

            await connectionToDB();
            const { petId, action } = await request.json();

            if (!petId || !['add', 'remove'].includes(action)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid request parameters'
                }, { status: 400 });
            }

            // Check if pet exists
            const pet = await Pet.findById(petId);
            if (!pet) {
                return NextResponse.json({
                    success: false,
                    message: 'Pet not found'
                }, { status: 404 });
            }

            // Find user's favorites document or create one
            let favorites = await Favorites.findOne({ userId: decoded.userId });

            if (!favorites) {
                favorites = new Favorites({
                    userId: decoded.userId,
                    pets: []
                });
            }

            // Add or remove pet based on action
            if (action === 'add' && !favorites.pets.includes(petId)) {
                favorites.pets.push(petId);
            } else if (action === 'remove') {
                favorites.pets = favorites.pets.filter(id =>
                    id.toString() !== petId.toString()
                );
            }

            await favorites.save();

            return NextResponse.json({
                success: true,
                message: action === 'add' ? 'Pet added to favorites' : 'Pet removed from favorites',
                isFavorited: action === 'add'
            });
        } catch (error) {
            console.error('Error managing favorites:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to update favorites'
            }, { status: 500 });
        }
    });
}

// Get check if a specific pet is favorited
export async function OPTIONS(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'adopter') {
                return NextResponse.json({
                    success: false,
                    isFavorited: false
                });
            }

            await connectionToDB();
            const url = new URL(request.url);
            const petId = url.searchParams.get('petId');

            if (!petId) {
                return NextResponse.json({
                    success: false,
                    message: 'Pet ID is required'
                }, { status: 400 });
            }

            const favorites = await Favorites.findOne({
                userId: decoded.userId,
                pets: petId
            });

            return NextResponse.json({
                success: true,
                isFavorited: !!favorites
            });
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return NextResponse.json({
                success: false,
                isFavorited: false
            });
        }
    });
}