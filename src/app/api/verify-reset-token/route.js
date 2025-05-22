import { NextResponse } from 'next/server';
import { verifyResetToken } from '../../../../lib/passwordReset';

export async function POST(request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({
                valid: false,
                error: 'Reset token is required'
            }, { status: 400 });
        }

        // Verify the token
        const decoded = verifyResetToken(token);

        if (!decoded) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid or expired reset token'
            });
        }

        return NextResponse.json({
            valid: true,
            userId: decoded.userId,
            email: decoded.email
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({
            valid: false,
            error: 'Failed to verify token'
        }, { status: 500 });
    }
}