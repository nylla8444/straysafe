import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../../../models/User'; // Fixed path and added /User
import connectionToDB from '../../../../../../../lib/mongoose'; // Added one more ../
import VerificationHistory from '../../../../../../../models/VerificationHistory'; // Added one more ../

export async function PUT(request, { params }) {
    try {
        // Authentication checks remain the same
        const tokenCookie = request.cookies.get('adminToken');
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
        if (!decoded.adminId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        // Get request body
        const { status, notes } = await request.json();

        // Validate status
        if (!['verified', 'followup', 'rejected', 'pending'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Connect to database
        await connectionToDB();

        // Get organization ID from route parameter - PROPERLY AWAITING PARAMS
        // Since Next.js 15+ requires awaiting params
        const resolvedParams = await Promise.resolve(params);
        const organizationId = resolvedParams.id;

        // Find the organization
        const organization = await User.findById(organizationId);

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Record verification history
        await VerificationHistory.create({
            organization: organizationId,
            admin: decoded.adminId,
            previousStatus: organization.verificationStatus,
            newStatus: status,
            notes: notes || '',
            timestamp: new Date()
        });

        // Update organization verification status
        const updatedOrg = await User.findByIdAndUpdate(
            organizationId,
            {
                verificationStatus: status,
                verificationNotes: notes || '',
                isVerified: status === 'verified',
                updatedAt: new Date()
            },
            { new: true }
        );

        // Return success response with updated organization
        return NextResponse.json({
            success: true,
            organization: {
                _id: updatedOrg._id,
                organizationName: updatedOrg.organizationName,
                verificationStatus: updatedOrg.verificationStatus,
                isVerified: updatedOrg.isVerified,
                verificationNotes: updatedOrg.verificationNotes
            }
        });

    } catch (error) {
        console.error('Error in organization verification:', error);
        return NextResponse.json({
            error: 'Failed to update verification status'
        }, { status: 500 });
    }
}