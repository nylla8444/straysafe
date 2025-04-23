import { NextResponse } from 'next/server';

export async function POST() {
    console.log('Processing admin logout request');

    // Create a response
    const response = NextResponse.json({
        success: true,
        message: 'Admin logged out successfully'
    });

    // Clear the admin token cookie
    response.cookies.set('adminToken', '', {
        expires: new Date(0),
        path: '/'
    });

    return response;
}