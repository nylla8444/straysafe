import User from "../../../../models/User";
import connectionToDB from "../../../../lib/mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Login request received");
    const body = await request.json();
    const { email, password } = body;

    // Find the user
    await connectionToDB();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // After validating password but before setting cookies, check email verification
    // Log the current verification status for debugging
    console.log("User verification status:", {
      email: user.email,
      isEmailVerified: user.isEmailVerified
    });

    // Check if email is verified - with added logging
    console.log("Email verification check:", {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      userFields: Object.keys(user._doc || user)
    });

    // Check if email is verified
    if (user.isEmailVerified === undefined || user.isEmailVerified === false) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in. Check your inbox for a verification link.' },
        { status: 403 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        userType: user.userType // Add userType to the token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data to send back (excluding password)
    const userData = {
      _id: user._id,
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationName: user.organizationName,
      isVerified: user.isVerified
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}