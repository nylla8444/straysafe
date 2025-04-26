import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
    pet_id: {
        type: Number,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    specie: {
        type: String,
        required: true,
        enum: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'other'],
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'unknown'],
    },
    breed: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['rehabilitating', 'available', 'adopted'],
        default: 'rehabilitating'
    },
    tags: [{
        type: String,
        enum: ['vaccinated', 'neutered', 'house-trained', 'special-needs', 'kid-friendly', 'senior', 'good-with-cats', 'good-with-dogs']
    }],
    img_arr: [{
        type: String,
        validate: {
            validator: function (arr) {
                return arr.length >= 1; // Require at least 1 image
            },
            message: 'At least one image is required'
        },
        required: true
    }],
    info: {
        type: String,
        required: true,
        trim: true
    },
    adoptionFee: {
        type: Number,
        required: true,
        min: 0
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function (orgId) {
                const User = mongoose.model('User');
                const org = await User.findById(orgId);
                return org && org.userType === 'organization' && org.isVerified === true;
            },
            message: 'Only verified organizations can post pets'
        }
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


petSchema.index({ status: 1 }); // For filtering by status
petSchema.index({ specie: 1 }); // For filtering by species
petSchema.index({ organization: 1 }); // For queries by organization
petSchema.index({ tags: 1 }); // For tag-based searches
petSchema.index({ name: 'text', breed: 'text' }); // Text search capabilities

// Auto-increment pet_id
petSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastPet = await this.constructor.findOne({}, {}, { sort: { 'pet_id': -1 } });
        this.pet_id = lastPet ? lastPet.pet_id + 1 : 1;
    }
    next();
});

// Update timestamp on save
petSchema.pre('save', function (next) {
    if (this.isModified()) {
        this.updatedAt = Date.now();
    }
    next();
});

const Pet = mongoose.models.Pet || mongoose.model("Pet", petSchema);

export default Pet;