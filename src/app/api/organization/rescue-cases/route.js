import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { RescueCase } from '../../../../../models/RescueCase';
import { uploadToStorage } from '../../../../../lib/storage';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { isValidObjectId } from 'mongoose';

// GET rescue cases for an organization
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Only organization accounts can access rescue cases'
                }, { status: 403 });
            }

            await connectionToDB();

            // Get query parameters
            const { searchParams } = new URL(request.url);
            const status = searchParams.get('status');

            // Build query with optional filters
            const query = { organization: decoded.userId };
            if (status) {
                query.status = status;
            }

            const rescueCases = await RescueCase.find(query).sort({ createdAt: -1 });

            return NextResponse.json({
                success: true,
                rescueCases
            });

        } catch (error) {
            console.error('Error fetching rescue cases:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch rescue cases'
            }, { status: 500 });
        }
    });
}

// POST a new rescue case
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Only organization accounts can create rescue cases'
                }, { status: 403 });
            }

            await connectionToDB();

            // Handle both JSON and form data
            let rescueData;
            const contentType = req.headers.get('content-type') || '';

            if (contentType.includes('multipart/form-data')) {
                const formData = await req.formData();

                // Process images if included
                const images = formData.getAll('images');
                const uploadedImages = [];

                if (images && images.length > 0) {
                    for (const image of images) {
                        if (image.size > 0) {
                            const uploadResult = await uploadToStorage(image, {
                                folder: 'strayspot/rescue-cases',
                                transformation: [
                                    { quality: 'auto' },
                                    { width: 800, crop: 'limit' }
                                ]
                            });
                            uploadedImages.push(uploadResult.url);
                        }
                    }
                }

                // Create rescue case data object from form data
                rescueData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    rescueDate: formData.get('rescueDate') ? new Date(formData.get('rescueDate')) : new Date(),
                    status: formData.get('status') || 'ongoing',
                    animalType: formData.get('animalType'),
                    images: uploadedImages,
                    organization: decoded.userId,
                };
            } else {
                // Handle JSON data
                const jsonData = await req.json();
                rescueData = {
                    ...jsonData,
                    organization: decoded.userId,
                    createdAt: new Date(),
                };
            }

            // Validation
            if (!rescueData.title) {
                return NextResponse.json({
                    success: false,
                    message: 'Title is required for rescue case'
                }, { status: 400 });
            }

            // Create rescue case ID if not provided
            if (!rescueData.caseId) {
                const prefix = 'RC';
                const timestamp = Date.now().toString().slice(-6);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                rescueData.caseId = `${prefix}-${timestamp}-${random}`;
            }

            // Create rescue case
            const rescueCase = new RescueCase(rescueData);
            await rescueCase.save();

            return NextResponse.json({
                success: true,
                message: 'Rescue case created successfully',
                rescueCase: {
                    _id: rescueCase._id,
                    caseId: rescueCase.caseId,
                    title: rescueCase.title,
                    status: rescueCase.status
                }
            }, { status: 201 });

        } catch (error) {
            console.error('Error creating rescue case:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to create rescue case: ' + error.message
            }, { status: 500 });
        }
    });
}

// PUT (update) an existing rescue case
export async function PUT(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Only organization accounts can update rescue cases'
                }, { status: 403 });
            }

            await connectionToDB();

            // Handle both JSON and form data
            let updateData;
            let rescueCaseId;
            const contentType = req.headers.get('content-type') || '';

            if (contentType.includes('multipart/form-data')) {
                const formData = await req.formData();
                rescueCaseId = formData.get('id');

                // Process new images if included
                const newImages = formData.getAll('newImages');
                const uploadedImages = [];

                if (newImages && newImages.length > 0) {
                    for (const image of newImages) {
                        if (image.size > 0) {
                            const uploadResult = await uploadToStorage(image, {
                                folder: 'strayspot/rescue-cases',
                                transformation: [
                                    { quality: 'auto' },
                                    { width: 800, crop: 'limit' }
                                ]
                            });
                            uploadedImages.push(uploadResult.url);
                        }
                    }
                }

                // Create update data object
                updateData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    status: formData.get('status'),
                    animalType: formData.get('animalType'),
                    updatedAt: new Date()
                };

                // Only add new images if there are any
                if (uploadedImages.length > 0) {
                    // Get existing images
                    const rescueCase = await RescueCase.findById(rescueCaseId);
                    updateData.images = [...(rescueCase?.images || []), ...uploadedImages];
                }

                // Handle removed images
                const removedImages = formData.get('removedImages');
                if (removedImages) {
                    try {
                        const removedImagesArray = JSON.parse(removedImages);
                        if (Array.isArray(removedImagesArray) && removedImagesArray.length > 0) {
                            const rescueCase = await RescueCase.findById(rescueCaseId);
                            updateData.images = (rescueCase?.images || []).filter(
                                img => !removedImagesArray.includes(img)
                            );
                            if (uploadedImages.length > 0) {
                                updateData.images = [...updateData.images, ...uploadedImages];
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing removed images:', error);
                    }
                }
            } else {
                // Handle JSON data
                const jsonData = await req.json();
                rescueCaseId = jsonData.id;
                updateData = {
                    ...jsonData,
                    updatedAt: new Date()
                };
                delete updateData.id; // Remove id from update data
                delete updateData.organization; // Prevent changing organization
                delete updateData.caseId; // Prevent changing case ID
            }

            // Find rescue case and validate ownership
            const existingCase = await RescueCase.findById(rescueCaseId);

            if (!existingCase) {
                return NextResponse.json({
                    success: false,
                    message: 'Rescue case not found'
                }, { status: 404 });
            }

            if (existingCase.organization.toString() !== decoded.userId) {
                return NextResponse.json({
                    success: false,
                    message: 'You do not have permission to update this rescue case'
                }, { status: 403 });
            }

            // Update rescue case
            const updatedCase = await RescueCase.findByIdAndUpdate(
                rescueCaseId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: 'Rescue case updated successfully',
                rescueCase: updatedCase
            });

        } catch (error) {
            console.error('Error updating rescue case:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to update rescue case: ' + error.message
            }, { status: 500 });
        }
    });
}

// DELETE a rescue case
export async function DELETE(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Only organization accounts can delete rescue cases'
                }, { status: 403 });
            }

            await connectionToDB();

            // Get rescue case ID from query params
            const { searchParams } = new URL(request.url);
            const rescueCaseId = searchParams.get('id');

            // Validate ID
            if (!rescueCaseId || !isValidObjectId(rescueCaseId)) {
                return NextResponse.json({
                    success: false,
                    message: 'Valid rescue case ID is required'
                }, { status: 400 });
            }

            // Find rescue case and validate ownership
            const existingCase = await RescueCase.findById(rescueCaseId);

            if (!existingCase) {
                return NextResponse.json({
                    success: false,
                    message: 'Rescue case not found'
                }, { status: 404 });
            }

            if (existingCase.organization.toString() !== decoded.userId) {
                return NextResponse.json({
                    success: false,
                    message: 'You do not have permission to delete this rescue case'
                }, { status: 403 });
            }

            // Delete the rescue case
            await RescueCase.findByIdAndDelete(rescueCaseId);

            return NextResponse.json({
                success: true,
                message: 'Rescue case deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting rescue case:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to delete rescue case: ' + error.message
            }, { status: 500 });
        }
    });
}