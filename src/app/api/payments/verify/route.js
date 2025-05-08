import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Payment from '../../../../../models/Payment';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function PUT(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Ensure user is an organization
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    error: 'Only organizations can verify payments'
                }, { status: 403 });
            }

            const data = await request.json();
            const { paymentId, status, notes } = data;

            // Validate input data
            if (!paymentId) {
                return NextResponse.json({
                    success: false,
                    error: 'Payment ID is required'
                }, { status: 400 });
            }

            if (!status || !['verified', 'rejected'].includes(status)) {
                return NextResponse.json({
                    success: false,
                    error: 'Status must be either "verified" or "rejected"'
                }, { status: 400 });
            }

            // Find the payment
            const payment = await Payment.findById(paymentId);

            if (!payment) {
                return NextResponse.json({
                    success: false,
                    error: 'Payment not found'
                }, { status: 404 });
            }

            // Ensure the payment belongs to this organization
            if (payment.organizationId.toString() !== decoded.userId) {
                return NextResponse.json({
                    success: false,
                    error: 'You do not have permission to verify this payment'
                }, { status: 403 });
            }

            // Ensure payment is in submitted status
            if (payment.status !== 'submitted') {
                return NextResponse.json({
                    success: false,
                    error: 'Only submitted payments can be verified or rejected'
                }, { status: 400 });
            }

            // Update payment status
            payment.status = status;
            payment.organizationNotes = notes || '';
            payment.dateVerified = new Date();
            payment.verifiedBy = decoded.userId;
            await payment.save();

            // Fetch updated payment with populated data for the frontend
            const updatedPayment = await Payment.findById(paymentId)
                .populate('petId', 'name breed img_arr')
                .populate('adopterId', 'firstName lastName email')
                .populate('organizationId', 'organizationName email')
                .populate('adoptionApplicationId', 'applicationId');

            return NextResponse.json({
                success: true,
                message: status === 'verified'
                    ? 'Payment has been verified successfully'
                    : 'Payment has been rejected',
                payment: updatedPayment
            });

        } catch (error) {
            console.error('Failed to verify payment:', error);

            // More specific error handling
            if (error.name === 'CastError') {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid payment ID format'
                }, { status: 400 });
            }

            return NextResponse.json({
                success: false,
                error: 'Failed to verify payment: ' + error.message
            }, { status: 500 });
        }
    });
}