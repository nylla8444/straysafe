import User from "../../../../models/User";
import connectionToDB from "../../../../lib/mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Login request received");
    await connectionToDB();
    console.log("connected to db");
    
    const { email, password } = await request.json();
    
    // Find the user
    const user = await User.findOne({ email });
    
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
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
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