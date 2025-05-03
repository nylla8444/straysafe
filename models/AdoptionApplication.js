import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema({
    applicationId: {
        type: Number,
        unique: true
    },
    
    // Relationship to user and pet
    adopterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the organization in User model
        required: true
    },
    
    // Application status
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'approved', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    
    // Form data from the application
    housingStatus: {
        type: String,
        required: true,
        enum: ['own', 'rent', 'live with friends/relatives', 'other']
    },
    petsAllowed: {
        type: String,
        required: true,
        enum: ['yes', 'no']
    },
    petLocation: {
        type: String,
        required: true
    },
    primaryCaregiver: {
        type: String,
        required: true
    },
    otherPets: {
        type: String,
        required: true,
        enum: ['yes', 'no']
    },
    financiallyPrepared: {
        type: String,
        required: true,
        enum: ['yes', 'no']
    },
    emergencyPetCare: {
        type: String,
        required: true
    },
    reference: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    termsAccepted: {
        type: Boolean,
        required: true,
        validate: {
            validator: v => v === true,
            message: "Terms and conditions must be accepted"
        }
    },
    
    // For organization's response
    organizationNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: String,
        default: ''
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-increment applicationId
adoptionApplicationSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastApp = await this.constructor.findOne({}, {}, { sort: { 'applicationId': -1 } });
        this.applicationId = lastApp ? lastApp.applicationId + 1 : 1;
    }
    next();
});

// Update timestamp on save
adoptionApplicationSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

// Create indexes for efficient queries
adoptionApplicationSchema.index({ adopterId: 1 });
adoptionApplicationSchema.index({ petId: 1 });
adoptionApplicationSchema.index({ organizationId: 1 });
adoptionApplicationSchema.index({ status: 1 });
adoptionApplicationSchema.index({ createdAt: 1 });

const AdoptionApplication = mongoose.models.AdoptionApplication || mongoose.model("AdoptionApplication", adoptionApplicationSchema);

export default AdoptionApplication;