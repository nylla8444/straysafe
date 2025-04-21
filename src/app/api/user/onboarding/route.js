import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';

export async function POST(request) {
    try {
        // Add debug logs
        console.log('Starting onboarding process');

        const token = request.cookies.get('token');
        console.log('Token exists:', !!token);

        if (!token) {
            console.log('No token found in request');
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        try {
            // Verify token and log user ID
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
            console.log('Token verified, user ID:', decoded.id);

            // Get request body and log it
            const data = await request.json();
            console.log('Onboarding data received:', data);

            await connectionToDB();
            console.log('Connected to database');

            // Update user with organization info
            const updatedUser = await User.findByIdAndUpdate(
                decoded.id,
                {
                    is_organization_member: data.is_organization_member,
                    organization_name: data.is_organization_member ? data.organization_name : null,
                    organization_location: data.is_organization_member ? data.organization_location : null,
                    organization_role: data.is_organization_member ? data.organization_role : null,
                    onboarding_completed: true
                },
                { new: true }
            );

            console.log('User updated:', !!updatedUser);

            if (!updatedUser) {
                console.log('User not found with ID:', decoded.id);
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            console.log('Onboarding completed successfully');

            // Return success with user data
            return NextResponse.json({
                message: 'Onboarding completed successfully',
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    is_organization_member: updatedUser.is_organization_member,
                    onboarding_completed: updatedUser.onboarding_completed
                }
            });

        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}