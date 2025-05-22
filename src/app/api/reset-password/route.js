import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { verifyResetToken } from '../../../../lib/passwordReset';

export async function POST(request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({
                success: false,
                error: 'Token and new password are required'
            }, { status: 400 });
        }

        // Password validation
        if (newPassword.length < 8) {
            return NextResponse.json({
                success: false,
                error: 'Password must be at least 8 characters long'
            }, { status: 400 });
        }

        // Verify the token
        const decoded = verifyResetToken(token);

        if (!decoded) {
            return NextResponse.json({
                success: false,
                error: 'Invalid or expired reset token'
            }, { status: 400 });
        }

        // Connect to database
        await connectionToDB();

        // Find the user
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        // Check if email in token matches user's current email
        if (decoded.email !== user.email) {
            return NextResponse.json({
                success: false,
                error: 'Email mismatch'
            }, { status: 400 });
        }

        // Don't hash here - let the pre-save hook handle it
        user.password = newPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to reset password'
        }, { status: 500 });
    }
}