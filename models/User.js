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


    // Adopter-specific fields
    firstName: {
        type: String,
        required: function () { return this.userType === 'adopter'; }
    },
    lastName: {
        type: String,
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
    isVerified: {
        type: Boolean,
        default: false // Organizations need verification
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

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

