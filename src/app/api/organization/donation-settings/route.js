import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { DonationSettings } from '../../../../../models/DonationSettings';
import { uploadToStorage } from '../../../../../lib/storage';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function PUT(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            if (decoded.userType !== 'organization') {
                return NextResponse.json({
                    success: false,
                    message: 'Only organization accounts can update donation settings'
                }, { status: 403 });
            }

            const formData = await req.formData();
            const donationQRFile = formData.get('donationQR');
            const bankDetailsJson = formData.get('bankDetails');
            const enableDonations = formData.get('enableDonations') === 'true';

            let bankDetails = {};
            if (bankDetailsJson) {
                try {
                    bankDetails = JSON.parse(bankDetailsJson);
                } catch (error) {
                    console.error('Error parsing bank details:', error);
                }
            }

            await connectionToDB();

            // Find or create settings document
            let settings = await DonationSettings.findOne({ organization: decoded.userId });

            if (!settings) {
                settings = new DonationSettings({ organization: decoded.userId });
            }

            // Upload QR image if provided
            if (donationQRFile) {
                try {
                    const uploadResult = await uploadToStorage(donationQRFile, {
                        folder: 'strayspot/donations',
                        transformation: [
                            { quality: 'auto' },
                            { width: 500, crop: 'limit' }
                        ]
                    });
                    settings.donationQR = uploadResult.url;
                } catch (uploadError) {
                    console.error('QR upload error:', uploadError);
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to upload QR image'
                    }, { status: 500 });
                }
            }

            // Update donation settings
            settings.bankDetails = bankDetails;
            settings.enableDonations = enableDonations;
            settings.updatedAt = new Date();

            await settings.save();

            return NextResponse.json({
                success: true,
                message: 'Donation settings updated successfully'
            });

        } catch (error) {
            console.error('Donation settings update error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to update donation settings'
            }, { status: 500 });
        }
    });
}

// Add a GET endpoint to retrieve settings
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            const { searchParams } = new URL(req.url);
            const organizationId = searchParams.get('organizationId') || decoded.userId;

            // Only allow fetching settings for your own organization unless it's a public request
            const isOwnOrganization = decoded.userId === organizationId;
            const isPublicRequest = searchParams.get('public') === 'true';

            if (!isOwnOrganization && !isPublicRequest && decoded.userType !== 'admin') {
                return NextResponse.json({
                    success: false,
                    message: 'Unauthorized to access these settings'
                }, { status: 403 });
            }

            await connectionToDB();

            const settings = await DonationSettings.findOne({ organization: organizationId });

            // If public request and donations are disabled, return limited info
            if (isPublicRequest && settings && !settings.enableDonations) {
                return NextResponse.json({
                    success: true,
                    settings: { enableDonations: false }
                });
            }

            return NextResponse.json({
                success: true,
                settings: settings || { enableDonations: false }
            });

        } catch (error) {
            console.error('Fetch donation settings error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch donation settings'
            }, { status: 500 });
        }
    }, true); // Allow public access with verification
}