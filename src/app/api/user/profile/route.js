// src/app/api/user/profile/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';
import { uploadToStorage } from '../../../../../lib/storage';

export async function PUT(request) {
    try {
        // Get user from token
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Process the form data
        const formData = await request.formData();
        const profileImageFile = formData.get('profileImage');

        // Prepare data object from form fields
        const data = {};
        for (const [key, value] of formData.entries()) {
            if (key !== 'profileImage') {
                data[key] = value;
            }
        }

        // Ensure sensitive fields can't be modified through this endpoint
        delete data.email;
        delete data.password;
        delete data.userType;
        delete data.isVerified;
        delete data.verificationStatus;

        // Add input validation before updating user
        if (data.contactNumber) {
            // Count only digits by removing non-digit characters
            const digitCount = data.contactNumber.replace(/\D/g, '').length;

            if (digitCount !== 11) {
                return NextResponse.json({
                    success: false,
                    message: 'Contact number must contain exactly 11 digits'
                }, { status: 400 });
            }

            //  If you want to also validate the format (allows formatting characters)
            if (!/^[0-9+\-\s()]+$/.test(data.contactNumber)) {
                return NextResponse.json({
                    success: false,
                    message: 'Contact number contains invalid characters'
                }, { status: 400 });
            }
        }

        if (data.location && data.location.length > 100) {
            return NextResponse.json({
                success: false,
                message: 'Location name too long'
            }, { status: 400 });
        }

        // Connect to database
        await connectionToDB();

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }

        // Update user data from form
        if (data.firstName) user.firstName = data.firstName;
        if (data.lastName) user.lastName = data.lastName;
        if (data.contactNumber) user.contactNumber = data.contactNumber;
        if (data.location) user.location = data.location;

        // Handle profile image upload if provided
        if (profileImageFile && profileImageFile instanceof File) {
            // Check file size (5MB limit)
            if (profileImageFile.size > 5 * 1024 * 1024) {
                return NextResponse.json({
                    success: false,
                    message: 'Profile image exceeds 5MB size limit'
                }, { status: 400 });
            }

            // Check file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(profileImageFile.type)) {
                return NextResponse.json({
                    success: false,
                    message: 'Only JPEG, PNG and WebP images are supported'
                }, { status: 400 });
            }

            try {
                const uploadResult = await uploadToStorage(profileImageFile, {
                    folder: 'straysafe_user_profiles',  // specific folder for user profiles
                    transformation: [
                        { width: 500, crop: 'limit' },  // Resize to save bandwidth
                        { quality: 'auto:good' }        // Good quality optimization
                    ]
                });

                // Update user with image URL
                user.profileImage = uploadResult.url;
            } catch (uploadError) {
                console.error('Error uploading profile image:', uploadError);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to upload profile image',
                    error: uploadError.message
                }, { status: 500 });
            }
        }

        // Save updated user
        await user.save();

        // Return updated user data
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                contactNumber: user.contactNumber,
                location: user.location,
                profileImage: user.profileImage,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);

        // Categorize errors for better client-side handling
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({
                success: false,
                message: 'Invalid authentication token',
                errorType: 'auth'
            }, { status: 401 });
        } else if (error.name === 'ValidationError') {
            return NextResponse.json({
                success: false,
                message: 'Validation error',
                details: Object.values(error.errors).map(e => e.message),
                errorType: 'validation'
            }, { status: 400 });
        }

        // Default server error
        return NextResponse.json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message,
            errorType: 'server'
        }, { status: 500 });
    }
}