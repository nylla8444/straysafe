import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';

export async function GET(request) {
    try {
        await connectionToDB();

        // Get only verified organizations
        const organizations = await User.find({
            userType: 'organization',
            isVerified: true,
            verificationStatus: 'verified'
        }, {
            // Only include necessary fields, exclude sensitive information
            password: 0,
            verificationDocument: 0
        });

        return NextResponse.json({
            success: true,
            organizations
        });
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch organizations'
        }, { status: 500 });
    }
}