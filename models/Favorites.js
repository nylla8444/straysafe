import mongoose from 'mongoose';

const FavoritesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // For faster queries by user ID
    },
    pets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure each user can only have one favorites document
FavoritesSchema.index({ userId: 1 }, { unique: true });

// Update timestamp on save
FavoritesSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Automatically populate the pets field with basic pet info when queried
FavoritesSchema.pre('find', function () {
    this.populate({
        path: 'pets',
        select: 'name breed specie img_arr status gender age adoptionFee',
        populate: {
            path: 'organization',
            select: 'organizationName profileImage'
        }
    });
});

// Also add this pre hook for findOne to ensure consistent behavior
FavoritesSchema.pre('findOne', function () {
    this.populate({
        path: 'pets',
        select: 'name breed specie img_arr status gender age adoptionFee',
        populate: {
            path: 'organization',
            select: 'organizationName profileImage'
        }
    });
});

const Favorites = mongoose.models.Favorites || mongoose.model('Favorites', FavoritesSchema);

export default Favorites;