import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Payment from '../../../../../models/Payment';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { uploadToStorage } from '../../../../../lib/storage';

export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Ensure user is an adopter
            if (decoded.userType !== 'adopter') {
                return NextResponse.json({ success: false, error: 'Only adopters can submit payment proof' }, { status: 403 });
            }

            // Get form data with the payment proof image
            const formData = await request.formData();
            const paymentId = formData.get('paymentId');
            const proofImage = formData.get('proofImage');
            const transactionId = formData.get('transactionId') || '';

            if (!paymentId || !proofImage) {
                return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
            }

            // Find the payment
            const payment = await Payment.findById(paymentId);

            if (!payment) {
                return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
            }

            // Ensure the payment belongs to this adopter
            if (payment.adopterId.toString() !== decoded.userId) {
                return NextResponse.json({ success: false, error: 'You do not have permission to submit payment for this application' }, { status: 403 });
            }

            try {
                // Upload proof image to Cloudinary with specific folder for payment proofs
                const proofImageResult = await uploadToStorage(proofImage, {
                    folder: 'strayspot/payments-proof',
                    transformation: [
                        { quality: 'auto' },
                        { width: 1200, crop: 'limit' }
                    ]
                });

                // Update payment with proof and transaction ID
                payment.proofOfTransaction = proofImageResult.url; // Access the URL directly
                payment.transactionId = transactionId;
                payment.status = 'submitted';
                payment.dateSubmitted = new Date();
                await payment.save();

                return NextResponse.json({
                    success: true,
                    payment: {
                        _id: payment._id,
                        paymentId: payment.paymentId,
                        status: payment.status,
                        dateSubmitted: payment.dateSubmitted,
                        proofOfTransaction: payment.proofOfTransaction
                    }
                });
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to upload payment proof image'
                }, { status: 500 });
            }

        } catch (error) {
            console.error('Failed to submit payment proof:', error);
            return NextResponse.json({ success: false, error: 'Failed to submit payment proof' }, { status: 500 });
        }
    });
}