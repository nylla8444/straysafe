import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { generateResetToken } from '../../../../lib/passwordReset';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
        }

        // Connect to database
        await connectionToDB();

        // Find the user
        const user = await User.findOne({ email: email.toLowerCase() });

        // For security reasons, always return success even if email is not found
        // This prevents email enumeration attacks
        if (!user) {
            console.log("Password reset requested for non-existent email:", email);
            return NextResponse.json({ success: true });
        }

        // Generate reset token
        const token = generateResetToken(user);

        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

        // Set up transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Send email
        await transporter.sendMail({
            from: '"StraySpot 🐾" <mail.strayspot@gmail.com>',
            to: user.email,
            subject: "Password Reset Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the button below to create a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #0D9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.</p>
          <p>Thank you,<br />The StraySpot Team</p>
        </div>
      `
        });

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, error: 'Something went wrong' },
            { status: 500 }
        );
    }
}