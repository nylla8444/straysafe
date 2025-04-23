import mongoose from 'mongoose';

const verificationHistorySchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        // Not required for resubmissions by the organization
    },
    previousStatus: {
        type: String,
        enum: ['pending', 'verified', 'followup', 'rejected'],
        required: true
    },
    newStatus: {
        type: String,
        enum: ['pending', 'verified', 'followup', 'rejected'],
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    resubmission: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const VerificationHistory = mongoose.models.VerificationHistory || mongoose.model('VerificationHistory', verificationHistorySchema);

export default VerificationHistory;