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

// Donation Schema
const DonationSchema = new mongoose.Schema({
    // Transaction information
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'PHP', // Philippine Peso as default
        enum: ['PHP', 'USD'] // Can expand as needed
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },

    // Donor information
    donor: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // Optional, as donations can be anonymous
        },
        name: String,
        email: String,
        isAnonymous: {
            type: Boolean,
            default: false
        }
    },

    // Organization receiving the donation
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming organizations are stored in User model
        required: true
    },

    // Payment details
    paymentMethod: {
        type: String,
        required: true,
        enum: ['bank_transfer', 'qr_code', 'cash', 'other']
    },
    paymentReference: String, // Reference number or confirmation code
    paymentProof: String, // URL to uploaded proof of payment image

    // Additional information
    message: String, // Optional message from donor
    purpose: {
        type: String,
        enum: ['general', 'medical', 'food', 'shelter', 'rescue', 'other'],
        default: 'general'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },

    // Administrative fields
    processingFee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: function () {
            return this.status === 'completed'; // Required only when completed
        }
    },
    receiptIssued: {
        type: Boolean,
        default: false
    },
    receiptNumber: String,

    // Timestamps
    donationDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Generate transaction ID before saving
DonationSchema.pre('save', async function (next) {
    if (!this.transactionId) {
        const prefix = 'DON';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.transactionId = `${prefix}-${timestamp}-${random}`;
    }

    // Calculate net amount if not provided
    if (this.status === 'completed' && !this.netAmount) {
        this.netAmount = this.amount - this.processingFee;
    }

    next();
});

// Add indexes for faster queries
DonationSchema.index({ organization: 1 });
DonationSchema.index({ "donor.userId": 1 });
DonationSchema.index({ donationDate: 1 });
DonationSchema.index({ status: 1 });

// Create models from schemas
const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
const DonationSettings = mongoose.models.DonationSettings || mongoose.model('DonationSettings', DonationSettingsSchema);

// Export both models properly
export { Donation, DonationSettings };
export default Donation;