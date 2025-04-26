import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function withAdminAuth(request, handler) {
    try {
        const tokenCookie = request.cookies.get('adminToken');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        if (!decoded.adminId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Pass the decoded token to the handler
        return handler(request, decoded);
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}