import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '../../../../../models/Admin';
import connectionToDB from '../../../../../lib/mongoose';

export async function POST(request) {
    try {
        console.log('Admin login request received in production');

        // Check if JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error('CRITICAL: JWT_SECRET not found in environment variables');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const { admin_id, password, adminCode } = await request.json();
        console.log('Admin ID received:', admin_id);

        if (!admin_id || !password || !adminCode) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        await connectionToDB();
        console.log('Database connection established');

        // Initialize default admin if none exists
        await Admin.initializeDefaultAdmin();
        console.log('Default admin initialization completed');

        // Find admin by ID
        const admin = await Admin.findOne({ admin_id });
        console.log('Admin found in database:', !!admin);

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify admin code
        if (admin.adminCode !== adminCode) {
            return NextResponse.json(
                { error: 'Invalid admin code' },
                { status: 401 }
            );
        }

        // Create JWT token with longer expiration
        const token = jwt.sign(
            { adminId: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie with proper settings
        const response = NextResponse.json({
            success: true,
            admin: {
                _id: admin._id,
                admin_id: admin.admin_id
            },
            token
        });

        // Update cookie settings for better compatibility
        response.cookies.set({
            name: 'adminToken',
            value: token,
            httpOnly: true,
            secure: true, // Always use secure in production
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
        });

        return response;

    } catch (error) {
        console.error('Admin login detailed error:', error);
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500 }
        );
    }
}