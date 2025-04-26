import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get user from database using the userId from decoded token
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Return user data
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
                    profileImage: user.profileImage,
                    isVerified: user.isVerified,
                    verificationStatus: user.verificationStatus,
                    verificationNotes: user.verificationNotes
                }
            });

        } catch (error) {
            console.error('Authentication check error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    });
}