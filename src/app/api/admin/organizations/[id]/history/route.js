import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import VerificationHistory from '../../../../../../../models/VerificationHistory';
import connectionToDB from '../../../../../../../lib/mongoose';

export async function GET(request, { params }) {
    try {
        // Change from 'token' to 'adminToken' to match your admin authentication system
        const tokenCookie = request.cookies.get('adminToken');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
        if (!decoded.adminId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Connect to database
        await connectionToDB();

        // Get organization ID from route parameter - using the proper way to handle dynamic params
        const resolvedParams = await Promise.resolve(params);
        const organizationId = resolvedParams.id;

        // Get verification history for this organization
        const history = await VerificationHistory.find({ organization: organizationId })
            .sort({ timestamp: -1 }) // Most recent first
            .populate('admin', 'name');

        return NextResponse.json({
            success: true,
            history
        });

    } catch (error) {
        console.error('Error fetching verification history:', error);
        return NextResponse.json({
            error: 'Failed to fetch verification history'
        }, { status: 500 });
    }
}