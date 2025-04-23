import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// TODO: update later
export async function GET(request) {
    try {
        // Get the token
        const token = request.cookies.get('token');

        if (!token) {
            return NextResponse.json({
                authenticated: false,
                message: 'No token found',
                cookies: Array.from(request.cookies.getAll())
                    .map(c => ({ name: c.name })) // Don't expose values
            });
        }

        // Try to decode the token
        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
            return NextResponse.json({
                authenticated: true,
                tokenInfo: {
                    userId: decoded.id,
                    email: decoded.email,
                    exp: new Date(decoded.exp * 1000).toISOString()
                },
                cookieDetails: {
                    name: token.name,
                    path: token.path,
                    expires: token.expires,
                    secure: token.secure,
                    httpOnly: token.httpOnly
                }
            });
        } catch (jwtError) {
            return NextResponse.json({
                authenticated: false,
                message: 'Invalid token',
                error: jwtError.message
            });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error checking auth debug' }, { status: 500 });
    }
}