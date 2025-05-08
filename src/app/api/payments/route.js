import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import Payment from '../../../../models/Payment';
import { withAuth } from '../../../../middleware/authMiddleware';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

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
                error: 'Failed to get payments'
            }, { status: 500 });
        }
    });
}