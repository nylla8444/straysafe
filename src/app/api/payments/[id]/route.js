import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import mongoose from 'mongoose';
import Payment from '../../../../../models/Payment';
import Pet from '../../../../../models/Pet';
import User from '../../../../../models/User';
import AdoptionApplication from '../../../../../models/AdoptionApplication';
import { withAuth } from '../../../../../middleware/authMiddleware';

// Function to ensure models are registered
function ensureModels() {
    // Only register models if they aren't already registered
    if (!mongoose.modelNames().includes('Pet')) {
        mongoose.model('Pet', Pet.schema);
    }
    if (!mongoose.modelNames().includes('User')) {
        mongoose.model('User', User.schema);
    }
    if (!mongoose.modelNames().includes('AdoptionApplication')) {
        mongoose.model('AdoptionApplication', AdoptionApplication.schema);
    }
}

export async function GET(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Ensure models are registered before querying
            ensureModels();

            //  Await params before accessing id
            const { id } = await params;

            if (!id) {
                return NextResponse.json({ success: false, error: 'Payment ID is required' }, { status: 400 });
            }

            // Find the payment and populate related data
            const payment = await Payment.findById(id)
                .populate('adopterId', 'user_id firstName lastName contactNumber location email')
                .populate('organizationId', 'user_id organizationName contactNumber location email')
                .populate('petId', 'pet_id name breed specie gender img_arr')
                .populate('adoptionApplicationId', 'applicationId');

            if (!payment) {
                return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
            }

            // Ensure user has permission to view this payment
            if (
                payment.adopterId._id.toString() !== decoded.userId &&
                payment.organizationId._id.toString() !== decoded.userId
            ) {
                return NextResponse.json({
                    success: false,
                    error: 'You do not have permission to view this payment'
                }, { status: 403 });
            }

            return NextResponse.json({ success: true, payment });

        } catch (error) {
            console.error('Failed to get payment details:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to get payment details: ' + error.message
            }, { status: 500 });
        }
    });
}