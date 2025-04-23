import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';

export async function GET(request) {
    try {
        // Get token from request cookies
        const tokenCookie = request.cookies.get('adminToken');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify the token
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        if (!decoded.adminId) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        // Connect to database
        await connectionToDB();

        // Get user statistics
        const totalUsers = await User.countDocuments();
        const adopters = await User.countDocuments({ userType: 'adopter' });
        const organizations = await User.countDocuments({ userType: 'organization' });

        // Count pending organizations
        const pendingOrganizations = await User.countDocuments({
            userType: 'organization',
            verificationStatus: 'pending',
            isVerified: false
        });

        return NextResponse.json({
            totalUsers,
            adopters,
            organizations,
            pendingOrganizations
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}