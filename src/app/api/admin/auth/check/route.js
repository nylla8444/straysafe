import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Admin from '../../../../../../models/Admin';
import connectionToDB from '../../../../../../lib/mongoose';

export async function GET(request) {
    console.log("Admin auth check API called");

    try {
        // Get token from request cookies
        const tokenCookie = request.cookies.get('adminToken');

        if (!tokenCookie || !tokenCookie.value) {
            console.log("Admin auth check - No token found in cookies");
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let token = tokenCookie.value;
        console.log("Admin token found in cookies, length:", token.length);

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded || !decoded.adminId) {
                console.log("Invalid token format");
                return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
            }

            console.log("JWT verified, admin ID:", decoded.adminId);

            // Connect to database and find admin
            await connectionToDB();
            const admin = await Admin.findById(decoded.adminId);

            if (!admin) {
                console.log("Admin not found in database for ID:", decoded.adminId);
                return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
            }

            // Success - send back admin data
            console.log("Admin authentication successful for:", admin.admin_id);
            return NextResponse.json({
                admin: {
                    _id: admin._id,
                    admin_id: admin.admin_id
                }
            });

        } catch (jwtError) {
            console.error("JWT verification failed:", jwtError.message);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
    } catch (error) {
        console.error("Admin auth check unexpected error:", error);
        return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
    }
}