import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    admin_id: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    adminCode: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

// Pre-save hook to hash password
adminSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Initialize with default admin if none exists
adminSchema.statics.initializeDefaultAdmin = async function () {
    try {
        const adminCount = await this.countDocuments();

        if (adminCount === 0) {
            await this.create({
                admin_id: '123',
                password: 'admin', // Will be hashed by pre-save hook
                adminCode: '111'
            });
            console.log('Default admin created');
        }
    } catch (error) {
        console.error('Failed to create default admin:', error);
    }
};

// Create the model
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;