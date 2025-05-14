import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    // Get the path being requested
    const path = request.nextUrl.pathname;

    // For debugging: Log all requests going through middleware
    console.log(`Middleware processing: ${path}`);

    // CRITICAL FIX: Skip middleware completely for admin login path
    if (path === '/api/admin/login') {
        console.log('Bypassing middleware for admin login API');
        return NextResponse.next();
    }

    // Skip API routes in development for easier debugging
    if (process.env.NODE_ENV === 'development' && path.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Admin route protection
    if (path.startsWith('/admin')) {
        // Always allow access to API routes in this block
        if (path.startsWith('/api/admin')) {
            return NextResponse.next();
        }

        const adminToken = request.cookies.get('adminToken')?.value;

        // If there's no token at all, redirect to login
        if (!adminToken) {
            return NextResponse.redirect(new URL('/login/admin', request.url));
        }

        // Don't validate the token here - just check it exists
        return NextResponse.next();
    }

    // Regular user authentication check
    const token = request.cookies.get('token')?.value;

    // Routes that require any authentication
    if ((path.startsWith('/ask') || path.startsWith('/profile') || path.startsWith('/organization')) && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection for authenticated routes
    if (token && (path.startsWith('/profile') || path.startsWith('/organization'))) {
        try {
            // Decode and verify the JWT
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload } = await jwtVerify(token, secret);

            // Extract user type with robust fallback
            const userType = payload.userType || 'unknown';

            // Log consistently formatted output for debugging
            console.log(`Auth check: Path=${path}, UserType=${userType}, UserId=${payload.userId}`);

            // Handle organization users
            if (path.startsWith('/profile') && userType === 'organization') {
                console.log("Access denied: Organization user trying to access adopter profile");
                // Use 307 to ensure POST requests are preserved
                return NextResponse.redirect(
                    new URL('/organization?source=middleware&redirect=unauthorized', request.url),
                    { status: 307 }
                );
            }

            // Handle adopter users
            if (path.startsWith('/organization') && userType === 'adopter') {
                console.log("Access denied: Adopter user trying to access organization dashboard");
                // Use 307 to ensure POST requests are preserved
                return NextResponse.redirect(
                    new URL('/profile?source=middleware&redirect=unauthorized', request.url),
                    { status: 307 }
                );
            }

            // If we reach here, the user is authorized for this path
            console.log(`Access granted: ${userType} accessing ${path}`);

        } catch (error) {
            // Handle token validation errors properly
            console.error('JWT verification failed:', error.message);

            // Clear the invalid token via response headers
            const response = NextResponse.redirect(new URL('/login?error=session_expired', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    // Also protect specific API routes by user type
    if (path.startsWith('/api/')) {
        // Check if this is a public donation settings request
        if (path === '/api/organization/donation-settings') {
            const url = new URL(request.url);
            const isPublicRequest = url.searchParams.get('public') === 'true';

            if (isPublicRequest) {
                console.log("Allowing public access to donation settings");
                return NextResponse.next();
            }
        }

        // For all other API routes, require authentication
        if (token) {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                const { payload } = await jwtVerify(token, secret);
                const userType = payload.userType || 'unknown';

                // Organization-only API endpoints
                if (path.startsWith('/api/organization/') || path.startsWith('/api/pets/manage')) {
                    if (userType !== 'organization') {
                        return new NextResponse(
                            JSON.stringify({ error: 'Access denied', message: 'Organizations only' }),
                            { status: 403, headers: { 'Content-Type': 'application/json' } }
                        );
                    }
                }

                // Adopter-only API endpoints
                if (path.startsWith('/api/adoptions/adopter')) {
                    if (userType !== 'adopter') {
                        return new NextResponse(
                            JSON.stringify({ error: 'Access denied', message: 'Adopters only' }),
                            { status: 403, headers: { 'Content-Type': 'application/json' } }
                        );
                    }
                }
            } catch (error) {
                // For API routes, return JSON error instead of redirecting
                return new NextResponse(
                    JSON.stringify({ error: 'Authentication failed', message: error.message }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }
        } else {
            // No token for a protected API route
            return new NextResponse(
                JSON.stringify({ error: 'Authentication required' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        {
            source: '/api/admin/:path*',
            not: [
                { source: '/api/admin/login' } // Exclude the login endpoint
            ]
        },
        '/ask/:path*',
        '/profile/:path*',
        '/profile',
        '/organization/:path*',
        '/organization',
        '/api/organization/:path*',
        '/api/organization/donation-settings',
        '/api/pets/manage/:path*',
        '/api/adoptions/:path*',
    ],
};