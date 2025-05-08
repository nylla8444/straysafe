import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    // Auto-incrementing ID
    paymentId: {
        type: Number,
        unique: true
    },

    // Reference connections
    adoptionApplicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdoptionApplication',
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    adopterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Payment details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    transactionId: {
        type: String,
        sparse: true, // Allows null values but ensures uniqueness when present
        trim: true
    },

    // Organization payment information
    qrImage: {
        type: String, // URL to Cloudinary image
        required: true
    },

    // Payment proof from adopter
    proofOfTransaction: {
        type: String, // URL to Cloudinary image
        default: null
    },

    // Status tracking
    status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected'],
        default: 'pending'
    },

    // Notes or instructions
    paymentInstructions: {
        type: String,
        default: ''
    },
    organizationNotes: {
        type: String,
        default: ''
    },

    // Timestamps
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateSubmitted: {
        type: Date,
        default: null
    },
    dateVerified: {
        type: Date,
        default: null
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-increment paymentId
paymentSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastPayment = await this.constructor.findOne({}, {}, { sort: { 'paymentId': -1 } });
        this.paymentId = lastPayment ? lastPayment.paymentId + 1 : 1;
    }
    next();
});

// Update timestamp on save
paymentSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }

    // Set submission date if status is changed to submitted
    if (this.isModified('status') && this.status === 'submitted' && !this.dateSubmitted) {
        this.dateSubmitted = Date.now();
    }

    // Set verification date if status is changed to verified
    if (this.isModified('status') && this.status === 'verified' && !this.dateVerified) {
        this.dateVerified = Date.now();
    }

    next();
});

// Create indexes for efficient queries
paymentSchema.index({ adopterId: 1 });
paymentSchema.index({ organizationId: 1 });
paymentSchema.index({ adoptionApplicationId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dateCreated: -1 }); // For sorting by most recent

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;