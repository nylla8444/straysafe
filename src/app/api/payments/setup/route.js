import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Payment from '../../../../../models/Payment';
import AdoptionApplication from '../../../../../models/AdoptionApplication';
import Pet from '../../../../../models/Pet';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { uploadToStorage } from '../../../../../lib/storage';

export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get form data
            const formData = await request.formData();
            const applicationId = formData.get('applicationId');
            const qrImage = formData.get('qrImage');
            const paymentInstructions = formData.get('paymentInstructions');

            if (!applicationId) {
                return NextResponse.json({
                    success: false,
                    error: 'Application ID is required'
                }, { status: 400 });
            }

            if (!qrImage) {
                return NextResponse.json({
                    success: false,
                    error: 'QR Image is required'
                }, { status: 400 });
            }

            // Verify application exists
            const application = await AdoptionApplication.findById(applicationId)
                .populate('petId');

            if (!application) {
                return NextResponse.json({
                    success: false,
                    error: 'Application not found'
                }, { status: 404 });
            }

            // Verify organization owns this application
            if (application.organizationId.toString() !== decoded.userId) {
                return NextResponse.json({
                    success: false,
                    error: 'You do not have permission to setup payment for this application'
                }, { status: 403 });
            }

            try {
                // Upload QR image to Cloudinary in a dedicated "payments" folder
                const qrImageUpload = await uploadToStorage(qrImage, {
                    folder: 'strayspot/payments', // Use dedicated payments folder
                    transformation: [
                        { quality: 'auto' },
                        { width: 500, crop: 'limit' } // Optimize size for QR codes
                    ]
                });

                // Get adoption fee from pet
                const petData = application.petId;
                const amount = petData.adoptionFee || 0;

                // Create payment record with generated ID
                const paymentId = Math.floor(100000 + Math.random() * 900000).toString();

                const payment = new Payment({
                    paymentId,
                    adoptionApplicationId: applicationId,
                    petId: petData._id,
                    adopterId: application.adopterId,
                    organizationId: application.organizationId,
                    qrImage: qrImageUpload.url, // Use the URL returned
                    paymentInstructions,
                    amount,
                    status: 'pending',
                    dateCreated: new Date()
                });

                await payment.save();

                // Update application with payment reference
                application.paymentId = payment._id;
                await application.save();

                return NextResponse.json({
                    success: true,
                    payment
                });
            } catch (uploadError) {
                console.error('QR image upload error:', uploadError);
                return NextResponse.json({
                    success: false,
                    error: 'Failed to upload QR image: ' + uploadError.message
                }, { status: 500 });
            }
        } catch (error) {
            console.error('Failed to setup payment:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to setup payment'
            }, { status: 500 });
        }
    });
}