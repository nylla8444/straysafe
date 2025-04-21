import { NextResponse } from 'next/server';

export async function POST() {
    // Create response
    const response = NextResponse.json({
        message: 'Logged out successfully'
    });

    // Remove the token cookie
    response.cookies.set('token', '', { expires: new Date(0) });
    return response;
}