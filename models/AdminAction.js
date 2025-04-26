import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userType: {
        type: String,
        enum: ['adopter', 'organization'],
        required: true
    },
    action: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.AdminAction || mongoose.model('AdminAction', adminActionSchema);