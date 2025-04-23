import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../../../../../../models/User';
import connectionToDB from '../../../../../../lib/mongoose';
import { uploadToStorage } from '../../../../../../lib/storage';
import VerificationHistory from '../../../../../../models/VerificationHistory';

export async function POST(request) {
    try {
        // Get token from request cookies
        const tokenCookie = request.cookies.get('token');

        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify the token
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return NextResponse.json({ error: 'Invalid token format' }, { status: 401 });
        }

        // Connect to database
        await connectionToDB();

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.userType !== 'organization') {
            return NextResponse.json({ error: 'Only organizations can submit verification' }, { status: 403 });
        }

        // Parse the multipart form data
        const formData = await request.formData();
        const additionalInfo = formData.get('additionalInfo');
        const document = formData.get('document');

        // Update verification status back to pending
        user.verificationStatus = 'pending';

        // If additional info provided, append to notes
        if (additionalInfo) {
            user.verificationResubmissionNotes = additionalInfo;
        }

        // If new document provided, upload it
        if (document) {
            try {
                const uploadResult = await uploadToStorage(document, {
                    folder: 'verification-documents',
                    transformation: [
                        { quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                });

                // Update document URL
                user.verificationDocument = uploadResult.url;
            } catch (uploadError) {
                console.error('Error uploading verification document:', uploadError);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to upload verification document',
                    error: uploadError.message
                }, { status: 500 });
            }
        }

        // Record resubmission in verification history
        await VerificationHistory.create({
            organization: user._id,
            previousStatus: user.verificationStatus,
            newStatus: 'pending',
            notes: additionalInfo || 'Document resubmitted',
            resubmission: true,
            timestamp: new Date()
        });

        // Save changes
        await user.save();

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Verification information submitted successfully'
        });

    } catch (error) {
        console.error('Error in verification resubmission:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process verification resubmission'
        }, { status: 500 });
    }
}