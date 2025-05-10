import { NextResponse } from 'next/server';
import { connectionToDB } from '../../../../lib/mongoose';
import Donation from '../../../../models/Donation';
import User from '../../../../models/User';
import { withAuth } from '../../../../middleware/authMiddleware';
import { uploadToStorage } from '../../../../lib/storage';

// Create a new donation
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const formData = await req.formData();
            const organizationId = formData.get('organizationId');
            const amount = parseFloat(formData.get('amount'));
            const paymentMethod = formData.get('paymentMethod');
            const paymentReference = formData.get('paymentReference');
            const message = formData.get('message');
            const purpose = formData.get('purpose');
            const isAnonymous = formData.get('isAnonymous') === 'true';

            // Payment proof upload (optional)
            const paymentProofFile = formData.get('paymentProof');
            let paymentProofUrl = null;

            if (paymentProofFile) {
                const uploadResult = await uploadToStorage(paymentProofFile, {
                    folder: 'strayspot/donations/proofs',
                });
                paymentProofUrl = uploadResult.url;
            }

            // Validate organization
            const organization = await User.findById(organizationId);
            if (!organization || organization.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid organization'
                }, { status: 400 });
            }

            // Create donation record
            const donation = new Donation({
                amount,
                organization: organizationId,
                paymentMethod,
                paymentReference,
                paymentProof: paymentProofUrl,
                message,
                purpose: purpose || 'general',
                donor: {
                    userId: isAnonymous ? null : decoded.userId,
                    name: isAnonymous ? 'Anonymous' : formData.get('name'),
                    email: isAnonymous ? null : formData.get('email'),
                    isAnonymous
                },
                status: 'pending' // Start as pending until verified by organization
            });

            await donation.save();

            return NextResponse.json({
                success: true,
                message: 'Donation recorded successfully',
                donation: {
                    transactionId: donation.transactionId,
                    amount: donation.amount,
                    status: donation.status,
                    donationDate: donation.donationDate
                }
            });

        } catch (error) {
            console.error('Donation creation error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to process donation'
            }, { status: 500 });
        }
    }, true); // Allow guest donations by passing true
}

// Get donation list (for organizations or admin)
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            const { searchParams } = new URL(req.url);
            const organizationId = searchParams.get('organizationId');

            // Check permissions
            const isAdmin = decoded.userType === 'admin';
            const isOrganizationOwner = decoded.userType === 'organization' &&
                decoded.userId === organizationId;

            if (!isAdmin && !isOrganizationOwner) {
                return NextResponse.json({
                    success: false,
                    message: 'Unauthorized to view donation records'
                }, { status: 403 });
            }

            await connectionToDB();

            // Build query based on filters
            const query = {};
            if (organizationId) {
                query.organization = organizationId;
            }

            // Additional filters can be added here
            const status = searchParams.get('status');
            if (status) {
                query.status = status;
            }

            // Date range filter
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            if (startDate || endDate) {
                query.donationDate = {};
                if (startDate) {
                    query.donationDate.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.donationDate.$lte = new Date(endDate);
                }
            }

            // Pagination
            const page = parseInt(searchParams.get('page')) || 1;
            const limit = parseInt(searchParams.get('limit')) || 20;
            const skip = (page - 1) * limit;

            // Fetch donations with pagination
            const donations = await Donation.find(query)
                .sort({ donationDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('organization', 'organizationName email');

            // Get total count for pagination
            const totalCount = await Donation.countDocuments(query);

            return NextResponse.json({
                success: true,
                donations,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                }
            });

        } catch (error) {
            console.error('Fetch donations error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch donation records'
            }, { status: 500 });
        }
    });
}