import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import CashDonation from '../../../../models/CashDonation';
import User from '../../../../models/User';
import { withAuth } from '../../../../middleware/authMiddleware';
import { isValidObjectId } from 'mongoose';

/**
 * POST /api/cash-donation
 * Create a new cash donation record
 */
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Accept both JSON and FormData formats
            let donationData;
            const contentType = req.headers.get('content-type') || '';

            if (contentType.includes('multipart/form-data')) {
                const formData = await req.formData();

                // Extract organization ID (default to current user if organization)
                const organizationId = formData.get('organizationId') ||
                    (decoded.userType === 'organization' ? decoded.userId : null);

                // Handle anonymous flag
                const isAnonymous = formData.get('isAnonymous') === 'true';

                donationData = {
                    organization: organizationId,
                    amount: parseFloat(formData.get('amount') || 0),
                    isAnonymous,
                    donorName: isAnonymous ? undefined : formData.get('name'),
                    donorEmail: isAnonymous ? undefined : formData.get('email'),
                    referenceNumber: formData.get('referenceNumber') || formData.get('paymentReference'),
                    message: formData.get('message'),
                    purpose: formData.get('purpose') || 'general',
                    donationDate: formData.get('donationDate') ? new Date(formData.get('donationDate')) : undefined
                };
            } else {
                // Handle JSON data
                const jsonData = await req.json();

                // Extract organization ID (default to current user if organization)
                const organizationId = jsonData.organizationId ||
                    (decoded.userType === 'organization' ? decoded.userId : null);

                donationData = {
                    organization: organizationId,
                    amount: parseFloat(jsonData.amount || 0),
                    isAnonymous: jsonData.isAnonymous || false,
                    donorName: jsonData.isAnonymous ? undefined : jsonData.donorName || jsonData.name,
                    donorEmail: jsonData.isAnonymous ? undefined : jsonData.donorEmail || jsonData.email,
                    referenceNumber: jsonData.referenceNumber || jsonData.paymentReference,
                    message: jsonData.message,
                    purpose: jsonData.purpose || 'general',
                    donationDate: jsonData.donationDate ? new Date(jsonData.donationDate) : undefined
                };
            }

            // Validate required data
            if (!donationData.amount || donationData.amount <= 0) {
                return NextResponse.json({
                    success: false,
                    message: 'Valid donation amount is required'
                }, { status: 400 });
            }

            if (!donationData.organization || !isValidObjectId(donationData.organization)) {
                return NextResponse.json({
                    success: false,
                    message: 'Valid organization ID is required'
                }, { status: 400 });
            }

            // Validate organization exists
            const organization = await User.findById(donationData.organization);
            if (!organization || organization.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Organization not found or invalid'
                }, { status: 400 });
            }

            // Generate donation ID if not already provided
            if (!donationData.donationId) {
                const prefix = 'CASH';
                const timestamp = Date.now().toString().slice(-6);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                donationData.donationId = `${prefix}-${timestamp}-${random}`;
            }

            // Create cash donation record
            const donation = new CashDonation(donationData);
            await donation.save();

            return NextResponse.json({
                success: true,
                message: 'Cash donation recorded successfully',
                donation: {
                    donationId: donation.donationId,
                    amount: donation.amount,
                    donationDate: donation.donationDate
                }
            });
        } catch (error) {
            console.error('Cash donation creation error:', error);

            // Handle specific error types
            if (error.name === 'ValidationError') {
                return NextResponse.json({
                    success: false,
                    message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
                }, { status: 400 });
            }

            if (error.name === 'CastError') {
                return NextResponse.json({
                    success: false,
                    message: `Invalid ${error.path}: ${error.value}`
                }, { status: 400 });
            }

            return NextResponse.json({
                success: false,
                message: 'Failed to record donation: ' + error.message
            }, { status: 500 });
        }
    }, true); // Allow guest donations
}

/**
 * GET /api/cash-donation
 * Retrieve cash donations for an organization
 */
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const { searchParams } = new URL(req.url);
            const organizationId = searchParams.get('organizationId');

            // If no organization ID is provided and user is an organization, use their own ID
            const targetOrgId = organizationId ||
                (decoded.userType === 'organization' ? decoded.userId : null);

            // Authorization check
            const isAdmin = decoded.userType === 'admin';
            const isOrgOwner = decoded.userType === 'organization' && decoded.userId === targetOrgId;

            if (!isAdmin && !isOrgOwner) {
                return NextResponse.json({
                    success: false,
                    message: 'Unauthorized to view these donation records'
                }, { status: 403 });
            }

            if (!targetOrgId) {
                return NextResponse.json({
                    success: false,
                    message: 'Organization ID is required'
                }, { status: 400 });
            }

            // Build query with filters
            const query = { organization: targetOrgId };

            // Purpose filter
            const purpose = searchParams.get('purpose');
            if (purpose) {
                query.purpose = purpose;
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
                    const nextDay = new Date(endDate);
                    nextDay.setDate(nextDay.getDate() + 1);
                    query.donationDate.$lt = nextDay;
                }
            }

            // Amount range filter
            const minAmount = searchParams.get('minAmount');
            const maxAmount = searchParams.get('maxAmount');

            if (minAmount || maxAmount) {
                query.amount = {};
                if (minAmount) {
                    query.amount.$gte = parseFloat(minAmount);
                }
                if (maxAmount) {
                    query.amount.$lte = parseFloat(maxAmount);
                }
            }

            // Pagination
            const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
            const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
            const skip = (page - 1) * limit;

            // Sort order
            const sortField = searchParams.get('sortBy') || 'donationDate';
            const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
            const sort = { [sortField]: sortOrder };

            // Execute query with pagination
            const donations = await CashDonation.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit);

            // Get total count for pagination
            const totalCount = await CashDonation.countDocuments(query);

            // Summary statistics
            const stats = await CashDonation.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const summary = stats.length > 0 ? {
                totalAmount: stats[0].totalAmount,
                averageAmount: stats[0].avgAmount,
                count: stats[0].count
            } : {
                totalAmount: 0,
                averageAmount: 0,
                count: 0
            };

            return NextResponse.json({
                success: true,
                donations,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    pages: Math.ceil(totalCount / limit)
                },
                summary
            });
        } catch (error) {
            console.error('Fetch cash donations error:', error);

            return NextResponse.json({
                success: false,
                message: 'Failed to retrieve donation records: ' + error.message
            }, { status: 500 });
        }
    });
}