import { NextResponse } from 'next/server';

export function middleware(request) {
    // Get token from cookies
    const token = request.cookies.get('token')?.value;

    // Check if the request is for a protected route
    if (request.nextUrl.pathname.startsWith('/ask')) {
        if (!token) {
            // Redirect to login if no token exists
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Continue to the requested page
    return NextResponse.next();
}

// Configure which routes to check with middleware
export const config = {
    matcher: ['/ask/:path*', '/profile/:path*']
};