import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Cache decoded tokens to prevent redundant verification
const tokenCache = new Map();

export async function withAuth(request, handler) {
    try {
        const tokenCookie = request.cookies.get('token');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const token = tokenCookie.value;

        // Check token cache first to avoid redundant verification
        let decoded = tokenCache.get(token);

        if (!decoded) {
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                // Cache the token for 5 minutes
                tokenCache.set(token, decoded);
                setTimeout(() => tokenCache.delete(token), 5 * 60 * 1000);
            } catch (jwtError) {
                console.error('JWT verification error:', jwtError.message);
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        }

        if (!decoded.userId) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        // Pass the decoded token to the handler
        return handler(request, decoded);
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}