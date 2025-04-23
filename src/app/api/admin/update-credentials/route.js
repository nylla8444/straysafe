import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Admin from '../../../../../models/Admin';
import connectionToDB from '../../../../../lib/mongoose';

export async function PUT(request) {
    console.log("Received admin credentials update request");

    try {
        // Get admin token
        const cookieStore = await cookies();
        const adminToken = cookieStore.get('adminToken');

        if (!adminToken) {
            console.log("No admin token found");
            return NextResponse.json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }

        // Verify token and get admin ID
        let decodedToken;
        try {
            decodedToken = jwt.verify(adminToken.value, process.env.JWT_SECRET);
            console.log("Token verified, admin ID:", decodedToken.adminId);
        } catch (tokenError) {
            console.error("Token verification failed:", tokenError);
            return NextResponse.json({
                success: false,
                message: 'Invalid authentication token'
            }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        console.log("Update fields received:", Object.keys(body));

        // Connect to database
        await connectionToDB();
        console.log("Connected to database");

        // Find the admin record
        const admin = await Admin.findById(decodedToken.adminId);
        if (!admin) {
            console.log("Admin not found");
            return NextResponse.json({
                success: false,
                message: 'Admin account not found'
            }, { status: 404 });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(body.currentPassword, admin.password);
        if (!isPasswordValid) {
            console.log("Current password verification failed");
            return NextResponse.json({
                success: false,
                message: 'Current password is incorrect'
            }, { status: 400 });
        }

        // Check if updating admin ID
        if (body.newAdminId && body.newAdminId !== admin.admin_id) {
            console.log("Updating admin ID from", admin.admin_id, "to", body.newAdminId);

            // Check if new admin ID is already in use
            const existingAdmin = await Admin.findOne({ admin_id: body.newAdminId });
            if (existingAdmin) {
                console.log("Admin ID already in use");
                return NextResponse.json({
                    success: false,
                    message: 'This Admin ID is already in use'
                }, { status: 400 });
            }

            admin.admin_id = body.newAdminId;
        }

        // Check if updating password
        if (body.newPassword) {
            console.log("Updating admin password");
            admin.password = body.newPassword;
            // Password will be hashed by the pre-save hook in the Admin model
        }

        // Check if updating admin code
        if (body.newAdminCode) {
            console.log("Updating admin code");
            admin.adminCode = body.newAdminCode;
        }

        // Save changes
        await admin.save();
        console.log("Admin credentials updated successfully");

        return NextResponse.json({
            success: true,
            message: 'Admin credentials updated successfully'
        });

    } catch (error) {
        console.error("Admin update error:", error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update admin credentials',
            error: error.message
        }, { status: 500 });
    }
}