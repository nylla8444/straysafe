import mongoose from 'mongoose';

// Donation Settings Schema
const DonationSettingsSchema = new mongoose.Schema({
    // Organization reference
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One settings document per organization
    },

    // QR code for payments
    donationQR: {
        type: String,  // URL to QR code image
        default: null
    },

    // Bank details for transfers
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        instructions: String
    },

    // Enable/disable donation feature
    enableDonations: {
        type: Boolean,
        default: true
    },

    // Configuration options
    acceptableDonationMethods: {
        type: [String],
        enum: ['bank_transfer', 'qr_code', 'cash', 'other'],
        default: ['bank_transfer', 'qr_code']
    },

    suggestedAmounts: [Number], // Optional preset donation amounts
    minimumDonation: {
        type: Number,
        default: 0
    },

    // Timestamps
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create model from schema
const DonationSettings = mongoose.models.DonationsSetting || mongoose.model('DonationSettings', DonationSettingsSchema);

// Export the model
export { DonationSettings };
export default DonationSettings;