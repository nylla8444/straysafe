import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Admin from '../../../../../models/Admin'; // Adjust path as needed
import connectionToDB from '../../../../../lib/mongoose';

export async function POST(request) {
    try {
        // Get the current token - FIX: Await cookies()
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('adminToken');

        if (!adminToken) {
            return NextResponse.json({ success: false, message: 'No token found' }, { status: 401 });
        }

        // Try to decode the token without verification to get the admin ID
        // This allows us to refresh even if the token is expired
        const decodedToken = jwt.decode(adminToken.value);

        if (!decodedToken || !decodedToken.adminId) {
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // Get admin from database
        await connectionToDB();
        const admin = await Admin.findById(decodedToken.adminId).select('-password');

        if (!admin) {
            return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
        }

        // Generate a new token
        const newToken = jwt.sign(
            { adminId: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create response with admin data
        const response = NextResponse.json({
            success: true,
            message: 'Token refreshed successfully',
            admin: {
                _id: admin._id,
                email: admin.email,
                name: admin.name
            }
        });

        // Set the new token as an HTTP-only cookie
        response.cookies.set({
            name: 'adminToken',
            value: newToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/'
        });

        return response;
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to refresh token'
        }, { status: 500 });
    }
}