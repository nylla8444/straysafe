import { NextResponse } from 'next/server';
import { rateLimit } from 'express-rate-limit';

// Apply rate limiting to login endpoint
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: 'Too many login attempts, please try again later'
});

export async function middleware(request) {
    // Allow API requests in development for easier debugging
    if (process.env.NODE_ENV === 'development' && request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Admin route protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Always allow access to API routes
        if (request.nextUrl.pathname.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        const adminToken = request.cookies.get('adminToken')?.value;

        // If there's no token at all, redirect to login
        if (!adminToken) {
            return NextResponse.redirect(new URL('/login/admin', request.url));
        }

        // Don't validate the token here - just check it exists
        // This allows the client-side code to handle token refreshing
        return NextResponse.next();
    }

    // Regular user route protection (unchanged)
    const token = request.cookies.get('token')?.value;
    if (request.nextUrl.pathname.startsWith('/ask') && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/ask/:path*',
        '/profile/:path*'
    ],
};