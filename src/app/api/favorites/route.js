import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import Favorites from '../../../../models/Favorites';
import Pet from '../../../../models/Pet';
import User from '../../../../models/User'; // Import User model
import { withAuth } from '../../../../middleware/authMiddleware';

// Ensure all models are registered before executing queries
function ensureModels() {
    // This makes sure the models are compiled
    if (mongoose.modelNames().indexOf('User') === -1) {
        console.log('User model was not registered. Forcing registration.');
        mongoose.model('User', User.schema);
    }

    if (mongoose.modelNames().indexOf('Pet') === -1) {
        console.log('Pet model was not registered. Forcing registration.');
        mongoose.model('Pet', Pet.schema);
    }

    if (mongoose.modelNames().indexOf('Favorites') === -1) {
        console.log('Favorites model was not registered. Forcing registration.');
        mongoose.model('Favorites', Favorites.schema);
    }
}

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
            ensureModels(); // Add this line

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
            ensureModels(); // Add this line
            const { petId, action } = await request.json();

            // Debug log
            console.log(`API: ${action} pet ${petId} from favorites for user ${decoded.userId}`);

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
            if (action === 'add') {
                // Use MongoDB's $addToSet operator to avoid duplicates and ensure atomic operation
                try {
                    await Favorites.updateOne(
                        { userId: decoded.userId },
                        { $addToSet: { pets: petId } }
                    );

                    // Refresh our local reference after the update
                    favorites = await Favorites.findOne({ userId: decoded.userId });

                    console.log(`API: After add - ${favorites.pets.length} pets in favorites`);
                } catch (addError) {
                    console.error('Error using $addToSet operation:', addError);
                    // Fallback to the original approach if $addToSet fails
                    const alreadyFavorited = favorites.pets.some(id =>
                        id.toString() === petId.toString()
                    );

                    if (!alreadyFavorited) {
                        favorites.pets.push(petId);
                        await favorites.save();
                    }
                }
            } else if (action === 'remove') {
                // Log the before state for debugging
                console.log(`API: Before removal - ${favorites.pets.length} pets in favorites`);

                // REPLACE the filter approach with MongoDB's $pull operator
                // This is more reliable for array operations in MongoDB
                try {
                    // Use updateOne with $pull instead of modifying the array directly
                    await Favorites.updateOne(
                        { userId: decoded.userId },
                        { $pull: { pets: petId } }
                    );

                    // Refresh our local reference after the update
                    favorites = await Favorites.findOne({ userId: decoded.userId });

                    console.log(`API: After removal - ${favorites.pets.length} pets in favorites`);
                } catch (pullError) {
                    console.error('Error using $pull operation:', pullError);
                    // Fallback to the original approach if $pull fails
                    const petIdStr = petId.toString();
                    favorites.pets = favorites.pets.filter(id => id.toString() !== petIdStr);
                    await favorites.save();
                }
            }

            // Get the updated list with populated data
            const updatedFavorites = await Favorites.findOne({ userId: decoded.userId })
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
                message: action === 'add' ? 'Pet added to favorites' : 'Pet removed from favorites',
                action: action,
                favorites: updatedFavorites?.pets || []
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
            ensureModels(); // Add this line
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