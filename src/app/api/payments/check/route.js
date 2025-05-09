import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import mongoose from 'mongoose';
import Payment from '../../../../../models/Payment';
import { withAuth } from '../../../../../middleware/authMiddleware';

// Function to ensure models are registered
function ensureModels() {
    if (!mongoose.modelNames().includes('Payment')) {
        mongoose.model('Payment', Payment.schema);
    }
}

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();
            ensureModels();

            // Get applicationId from query params
            const url = new URL(request.url);
            const applicationId = url.searchParams.get('applicationId');

            if (!applicationId) {
                return NextResponse.json({
                    success: false,
                    error: 'Application ID is required'
                }, { status: 400 });
            }

            // Find payment by adoptionApplicationId
            const payment = await Payment.findOne({ adoptionApplicationId: applicationId });

            return NextResponse.json({
                success: true,
                payment
            });

        } catch (error) {
            console.error('Failed to check payment:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to check payment: ' + error.message
            }, { status: 500 });
        }
    });
}