import { NextResponse } from 'next/server';
import { verifyEmailToken } from '../../../../lib/emailVerification';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import mongoose from 'mongoose';

export async function POST(request) {
    try {
        const { token } = await request.json();

        console.log("Received verification request", { tokenReceived: !!token });

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Verification token is required'
            }, { status: 400 });
        }

        // Verify the token
        const decoded = verifyEmailToken(token);

        if (!decoded) {
            console.log("Token validation failed");
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired verification token'
            }, { status: 400 });
        }

        console.log("Token decoded", { userId: decoded.userId });

        // Connect to database
        await connectionToDB();

        // Verify userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            console.log("Invalid ObjectId format:", decoded.userId);
            return NextResponse.json({
                success: false,
                error: 'Invalid user ID format'
            }, { status: 400 });
        }

        // Find and update the user in a single operation using findOneAndUpdate
        try {
            // Use findOneAndUpdate with explicit field names
            const updateResult = await User.findOneAndUpdate(
                { _id: decoded.userId },
                {
                    $set: {
                        isEmailVerified: true,
                        emailVerifiedAt: new Date()
                    }
                },
                {
                    new: true,
                }
            );

            console.log("Update complete - field values:", {
                id: updateResult._id,
                email: updateResult.email,
                isEmailVerified: updateResult.isEmailVerified,
                fieldsSet: !!updateResult.isEmailVerified
            });

            if (!updateResult) {
                return NextResponse.json({
                    success: false,
                    error: 'User not found'
                }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: 'Email verified successfully',
                userId: updateResult._id,
                email: updateResult.email
            });

        } catch (dbError) {
            console.error("Database error during update:", dbError);
            return NextResponse.json({
                success: false,
                error: 'Database error: ' + dbError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json({
            success: false,
            error: 'Verification failed: ' + error.message
        }, { status: 500 });
    }
}