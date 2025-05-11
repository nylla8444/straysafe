import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { DonationSettings } from '../../../../../models/DonationSettings';
import { uploadToStorage } from '../../../../../lib/storage';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { isValidObjectId } from 'mongoose';

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

// Fix the GET endpoint to better handle public requests
export async function GET(request) {
    const url = new URL(request.url);
    const isPublicRequest = url.searchParams.get('public') === 'true';
    const organizationId = url.searchParams.get('organizationId');

    // For public requests, bypass authentication completely
    if (isPublicRequest && organizationId) {
        try {
            await connectionToDB();
            
            if (!isValidObjectId(organizationId)) {
                return NextResponse.json({
                    success: false,
                    message: 'Invalid organization ID format'
                }, { status: 400 });
            }
            
            const settings = await DonationSettings.findOne({ organization: organizationId });
            
            // Only return enabled settings for public requests
            if (settings && settings.enableDonations) {
                return NextResponse.json({
                    success: true,
                    settings: {
                        donationQR: settings.donationQR,
                        bankDetails: settings.bankDetails,
                        enableDonations: settings.enableDonations
                    }
                });
            } else {
                // Return a safe default for public requests
                return NextResponse.json({
                    success: true,
                    settings: { enableDonations: false }
                });
            }
        } catch (error) {
            console.error('Fetch public donation settings error:', error);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch donation settings'
            }, { status: 500 });
        }
    }

    // Handle authenticated requests
    return withAuth(request, async (req, decoded) => {
        try {
            const { searchParams } = new URL(req.url);
            const targetOrgId = searchParams.get('organizationId') || decoded.userId;

            // Security check
            const isOwnOrganization = decoded.userId === targetOrgId;
            const isAdmin = decoded.userType === 'admin';
            
            if (!isOwnOrganization && !isAdmin) {
                return NextResponse.json({
                    success: false,
                    message: 'Unauthorized to access these settings'
                }, { status: 403 });
            }

            await connectionToDB();
            const settings = await DonationSettings.findOne({ organization: targetOrgId });

            return NextResponse.json({
                success: true,
                settings: settings || { enableDonations: false }
            });
        } catch (error) {
            console.error('Fetch authenticated donation settings error:', error);
            return NextResponse.json({
                success: false, 
                message: 'Failed to fetch donation settings'
            }, { status: 500 });
        }
    });
}