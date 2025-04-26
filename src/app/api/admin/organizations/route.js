import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';
import { withAdminAuth } from '../../../../../middleware/adminAuthMiddleware';

export async function GET(request) {
    return withAdminAuth(request, async (req, decoded) => {
        try {
            // Connect to database
            await connectionToDB();

            // Get status filter from query params
            const { searchParams } = new URL(request.url);
            const status = searchParams.get('status') || 'pending';

            // Set filter based on status
            let filter = { userType: 'organization' };

            if (status === 'verified') {
                filter.isVerified = true;
            } else if (status !== 'all') {
                filter.verificationStatus = status;
                // Make sure 'verified' isn't counted as pending, follow-up, or rejected
                filter.isVerified = false;
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
    });
}