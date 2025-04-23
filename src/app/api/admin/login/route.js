import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '../../../../../models/Admin';
import connectionToDB from '../../../../../lib/mongoose';

export async function POST(request) {
    try {
        const { admin_id, password, adminCode } = await request.json();

        if (!admin_id || !password || !adminCode) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        await connectionToDB();

        // Initialize default admin if none exists
        await Admin.initializeDefaultAdmin();

        // Find admin by ID
        const admin = await Admin.findOne({ admin_id });

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
            { expiresIn: '7d' } // Increase from 1d to 7d
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

        // Important: Update these cookie settings
        response.cookies.set({
            name: 'adminToken',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only true in production
            sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
        });

        return response;

    } catch (error) {
        console.log('Admin login error:', error);
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        );
    }
}