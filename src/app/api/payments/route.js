import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import mongoose from 'mongoose';
import Payment from '../../../../models/Payment';
import Pet from '../../../../models/Pet';
import User from '../../../../models/User';
import { withAuth } from '../../../../middleware/authMiddleware';

// Function to ensure models are registered
function ensureModels() {
    // Only register models if they aren't already registered
    if (!mongoose.modelNames().includes('Pet')) {
        mongoose.model('Pet', Pet.schema);
    }
    if (!mongoose.modelNames().includes('User')) {
        mongoose.model('User', User.schema);
    }
}

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Ensure models are registered before querying
            ensureModels();

            let query = {};

            // Filter based on user type
            if (decoded.userType === 'adopter') {
                query.adopterId = decoded.userId;
            } else if (decoded.userType === 'organization') {
                query.organizationId = decoded.userId;
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid user type'
                }, { status: 403 });
            }

            // Get payments with populated data
            const payments = await Payment.find(query)
                .populate('petId', 'name breed img_arr')
                .populate('adopterId', 'firstName lastName email')
                .populate('organizationId', 'organizationName email')
                .sort({ dateCreated: -1 });

            return NextResponse.json({
                success: true,
                payments
            });

        } catch (error) {
            console.error('Failed to get payments:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to get payments: ' + error.message
            }, { status: 500 });
        }
    });
}