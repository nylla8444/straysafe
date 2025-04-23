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

        // Get status filter from query params
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        // Set filter based on status
        let filter = { userType: 'organization' };

        // Map 'verified' status to isVerified: true, and other statuses to their verificationStatus value
        if (status === 'verified') {
            filter.isVerified = true;
        } else {
            filter.verificationStatus = status;
            // Make sure 'verified' isn't counted as pending, follow-up, or rejected
            if (status !== 'all') {
                filter.isVerified = false;
            }
        }

        // Get organizations based on filter
        const organizations = await User.find(
            filter,
            {
                _id: 1,
                organizationName: 1,
                email: 1,
                contactNumber: 1,
                location: 1,
                profileImage: 1,
                verificationDocument: 1,
                verificationStatus: 1,
                verificationNotes: 1,
                isVerified: 1,
                createdAt: 1
            }
        ).sort({ createdAt: -1 });

        return NextResponse.json({ organizations });

    } catch (error) {
        console.error('Admin organizations fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organizations' },
            { status: 500 }
        );
    }
}