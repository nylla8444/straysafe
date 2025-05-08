import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Payment from '../../../../../models/Payment';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Fix 1: Await params before accessing id
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
            return NextResponse.json({ success: false, error: 'Failed to get payment details' }, { status: 500 });
        }
    });
}