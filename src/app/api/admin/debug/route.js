import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
    try {
        // Get all cookies
        const cookies = request.cookies;
        const cookiesList = [];
        
        cookies.getAll().forEach(cookie => {
            cookiesList.push({
                name: cookie.name,
                exists: true,
                valueLength: cookie.value ? cookie.value.length : 0
            });
        });
        
        // Check specifically for adminToken
        const adminToken = cookies.get('adminToken');
        let tokenInfo = { exists: false };
        
        if (adminToken && adminToken.value) {
            try {
                // Try to decode and verify token
                const decoded = jwt.verify(adminToken.value, process.env.JWT_SECRET);
                tokenInfo = {
                    exists: true,
                    isValid: true,
                    adminId: decoded?.adminId || 'missing',
                    exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'missing',
                    iat: decoded?.iat ? new Date(decoded.iat * 1000).toISOString() : 'missing',
                    expiresIn: decoded?.exp ? Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60) + ' minutes' : 'unknown'
                };
            } catch (err) {
                tokenInfo = {
                    exists: true,
                    isValid: false,
                    error: err.message
                };
            }
        }

        // Check session storage (server can't access this, but useful info for debugging)
        return NextResponse.json({
            cookies: cookiesList,
            adminToken: tokenInfo,
            note: "Session storage can only be checked in browser console with: JSON.parse(sessionStorage.getItem('adminData'))",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}