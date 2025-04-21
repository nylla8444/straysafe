import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';

export async function GET(request) {
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
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Return user data matching your updated schema
        return NextResponse.json({
            user: {
                _id: user._id,
                email: user.email,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
                organizationName: user.organizationName,
                contactNumber: user.contactNumber,
                location: user.location,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.error('Authentication check error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' }, 
            { status: 401 }
        );
    }
}