import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';
import { uploadToStorage } from '../../../../../lib/storage';

export async function PUT(request) {
    try {
        // Get token from request cookies
        const tokenCookie = request.cookies.get('token');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify the token
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        // Get user from database
        await connectionToDB();
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.userType !== 'organization') {
            return NextResponse.json({ error: 'Only organizations can update profile' }, { status: 403 });
        }

        // Parse the multipart form data
        const formData = await request.formData();

        // Update user fields
        if (formData.get('organizationName')) {
            user.organizationName = formData.get('organizationName');
        }

        if (formData.get('contactNumber')) {
            user.contactNumber = formData.get('contactNumber');
        }

        if (formData.get('location')) {
            user.location = formData.get('location');
        }

        // Handle profile image upload if present
        const profileImage = formData.get('profileImage');
        if (profileImage) {
            try {
                const uploadResult = await uploadToStorage(profileImage, {
                    folder: 'organization-profiles', // Use a specific folder for organization profile images
                    transformation: [
                        { width: 600, height: 600, crop: 'fill', gravity: 'auto' }, // Resize to standard size
                        { quality: 'auto' }, // Optimize quality
                        { fetch_format: 'auto' } // Optimize format
                    ]
                });

                user.profileImage = uploadResult.url;
            } catch (uploadError) {
                console.error('Profile image upload failed:', uploadError);
                return NextResponse.json(
                    { error: 'Failed to upload profile image. Please try again.' },
                    { status: 500 }
                );
            }
        }

        // Save updated user
        user.updatedAt = new Date();
        await user.save();

        // Return the updated user data (excluding sensitive fields)
        return NextResponse.json({
            success: true,
            message: 'Organization profile updated successfully',
            organization: {
                _id: user._id,
                email: user.email,
                userType: user.userType,
                organizationName: user.organizationName,
                contactNumber: user.contactNumber,
                location: user.location,
                profileImage: user.profileImage,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Update organization profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update organization profile' },
            { status: 500 }
        );
    }
}