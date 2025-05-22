import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import connectionToDB from '../../../../lib/mongoose';
import { uploadToStorage } from '../../../../lib/storage';
import { generateVerificationToken } from '../../../../lib/emailVerification';
import nodemailer from 'nodemailer';

async function sendVerificationEmail(user) {
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
        <h2>Welcome to StraySpot!</h2>
        <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${verificationUrl}" style="background-color: #0D9488; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
        <p>Thank you,<br />The StraySpot Team</p>
      </div>
    `
  });
}

export async function POST(request) {
  try {
    await connectionToDB();
    console.log('connected to db');

    // Check content type and parse accordingly
    const contentType = request.headers.get('content-type') || '';

    let userData = {};

    if (contentType.includes('multipart/form-data')) {
      // Handle form data (for organization with file upload)
      const formData = await request.formData();
      console.log('Form data received:', Object.fromEntries(formData.entries()));

      const userType = formData.get('userType');

      userData = {
        userType: userType,
        email: formData.get('email'),
        password: formData.get('password'),
        contactNumber: formData.get('contactNumber'),
        location: formData.get('city') + ', ' + formData.get('province'),
      };

      // For organization
      if (userType === 'organization') {
        userData.organizationName = formData.get('organizationName');

        // Handle file upload with Cloudinary
        const verificationFile = formData.get('verificationDocument');
        if (verificationFile) {
          try {
            const uploadResult = await uploadToStorage(verificationFile);
            userData.verificationDocument = uploadResult.url;
          } catch (uploadError) {
            console.error('Document upload failed:', uploadError);
            return NextResponse.json(
              { error: 'Failed to upload verification document. Please try again.' },
              { status: 500 }
            );
          }
        }
      }

    } else {
      // Handle JSON data (for adopter registration)
      const jsonData = await request.json();
      console.log('JSON data received:', jsonData);

      userData = {
        userType: jsonData.userType,
        email: jsonData.email,
        password: jsonData.password,
        contactNumber: jsonData.contactNumber,
        location: jsonData.city + ', ' + jsonData.province,
      };

      // For adopter
      if (jsonData.userType === 'adopter') {
        userData.firstName = jsonData.firstName;
        userData.lastName = jsonData.lastName;
      }
    }

    console.log('User data to be saved:', userData);

    // Email validation
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Phone number validation - exactly 11 digits
    const digits = userData.contactNumber.replace(/\D/g, '');
    if (digits.length !== 11) {
      return NextResponse.json(
        // TODO: remove error after 3s
        { error: 'Contact number must contain exactly 11 digits' },
        { status: 400 }
      );
    }

    // Allow only valid characters in phone number
    if (!/^[0-9+\-\s()]+$/.test(userData.contactNumber)) {
      return NextResponse.json(
        { error: 'Contact number contains invalid characters' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (userData.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Create and save new user
    const newUser = new User({
      ...userData,
      isEmailVerified: false,  // Explicitly set this
      emailVerifiedAt: null    // Explicitly set this
    });
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser);

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      redirect: '/login?verify=true' // Add this to indicate where frontend should redirect
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}