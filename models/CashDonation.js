import mongoose from 'mongoose';

// Cash Donation Schema - Simplified for direct cash donations
const CashDonationSchema = new mongoose.Schema({
    // Organization receiving the donation
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Donation ID - automatically generated
    donationId: {
        type: String,
        required: true,
        unique: true,
        default: function () {
            const prefix = 'CASH';
            const timestamp = Date.now().toString().slice(-6);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            return `${prefix}-${timestamp}-${random}`;
        }
    },

    // Amount donated
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    // Anonymous donation settings
    isAnonymous: {
        type: Boolean,
        default: false
    },

    // Donor information (optional if anonymous)
    donorName: {
        type: String,
        required: function () {
            return !this.isAnonymous;
        }
    },
    donorEmail: {
        type: String,
        required: function () {
            return !this.isAnonymous;
        }
    },

    // Reference or receipt number
    referenceNumber: String,

    // Additional details
    message: String,

    // Purpose of donation
    purpose: {
        type: String,
        enum: ['general', 'medical', 'food', 'shelter', 'rescue', 'other'],
        default: 'general'
    },

    // Donation date
    donationDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Remove the pre-save hook since it's redundant with the default function
// The default function runs before validation, while pre-save runs after validation

// Add indexes for faster queries
CashDonationSchema.index({ organization: 1 });
CashDonationSchema.index({ donationDate: -1 });
CashDonationSchema.index({ purpose: 1 });

// Create model
const CashDonation = mongoose.models.CashDonation ||
    mongoose.model('CashDonation', CashDonationSchema);

export default CashDonation;