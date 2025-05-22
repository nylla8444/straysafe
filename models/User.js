import mongoose from "mongoose";
import bcrypt from "bcrypt";

// DELETE THE DB (collection) if you have edited this schema
const userSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
    },

    contactNumber: {
        type: String,
        required: true,
    },

    location: {
        type: String,
        required: true,
    },

    userType: {
        type: String,
        enum: ['adopter', 'organization'],
        required: true
    },


    profileImage: {
        type: String,
        default: '' // Default empty for all user types
    },


    // Adopter-specific fields
    firstName: {
        type: String,
        required: function () { return this.userType === 'adopter'; }
    },
    lastName: {
        type: String,
        required: function () { return this.userType === 'adopter'; }
    },

    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active',
        required: function () { return this.userType === 'adopter'; }
    },


    // Organization-specific fields
    organizationName: {
        type: String,
        required: function () { return this.userType === 'organization'; }
    },
    verificationDocument: {
        type: String, // URL to uploaded document
        required: function () { return this.userType === 'organization'; }
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'followup', 'rejected'],
        default: 'pending'
    },
    verificationNotes: {
        type: String,
        default: ''
    },

    isVerified: {
        type: Boolean,
        default: false // Will be set to true when verificationStatus is 'verified'
    },

    // New fields for email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    },


    // Common fields
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Pre-save middleware to handle auto-incrementing user_id
userSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastUser = await this.constructor.findOne({}, {}, { sort: { 'user_id': -1 } });
        this.user_id = lastUser ? lastUser.user_id + 1 : 1;
    }
    next();
});


// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Add a pre-save hook to ensure consistency
userSchema.pre('save', function (next) {
    if (this.isModified('verificationStatus')) {
        this.isVerified = (this.verificationStatus === 'verified');
    }
    next();
});

// Add this pre-save hook
userSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

