import { NextResponse } from 'next/server';
import User from '../../../../models/User';
import connectionToDB from '../../../../lib/mongoose';
import { uploadToStorage } from '../../../../lib/storage';

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
    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}