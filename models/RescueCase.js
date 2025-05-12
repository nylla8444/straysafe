import mongoose from 'mongoose';

const rescueCaseSchema = new mongoose.Schema({
    caseId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rescueDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'cancelled'],
        default: 'ongoing'
    },
    animalType: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    outcome: {
        type: String,
        default: ''
    },
    medicalDetails: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create or reuse model
export const RescueCase = mongoose.models.RescueCase || mongoose.model('RescueCase', rescueCaseSchema);

export default RescueCase;