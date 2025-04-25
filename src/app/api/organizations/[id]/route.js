import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import User from '../../../../../models/User';

export async function GET(request, { params }) {
    try {
        await connectionToDB();

        // Fix: Properly await params before accessing the id property
        const resolvedParams = await Promise.resolve(params);
        const organizationId = resolvedParams.id;

        // Get organization details excluding sensitive information
        const organization = await User.findOne(
            {
                _id: organizationId,
                userType: 'organization',
                isVerified: true,
                verificationStatus: 'verified'
            },
            {
                password: 0,
                verificationDocument: 0
            }
        );

        if (!organization) {
            return NextResponse.json({
                success: false,
                error: 'Organization not found or not verified'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            organization
        });
    } catch (error) {
        console.error('Error fetching organization:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch organization'
        }, { status: 500 });
    }
}