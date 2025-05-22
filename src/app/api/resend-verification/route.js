import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import connectionToDB from '../../../../lib/mongoose';
import { generateVerificationToken } from '../../../../lib/emailVerification';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email is required'
            }, { status: 400 });
        }

        // Connect to database
        await connectionToDB();

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        // Always return success to prevent email enumeration
        if (!user || user.isEmailVerified) {
            return NextResponse.json({
                success: true,
                message: 'If your email is in our system and not verified, you will receive a verification link shortly'
            });
        }

        // Create token
        const token = generateVerificationToken(user);

        // Create verification URL
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

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
            subject: "Verify Your StraySpot Account",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Verify Your StraySpot Email</h2>
          <p>You requested a new verification link. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verificationUrl}" style="background-color: #0D9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.</p>
          <p>Thank you,<br />The StraySpot Team</p>
        </div>
      `
        });

        return NextResponse.json({
            success: true,
            message: 'If your email is in our system and not verified, you will receive a verification link shortly'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process verification request'
        }, { status: 500 });
    }
}