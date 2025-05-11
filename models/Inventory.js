import mongoose from 'mongoose';

// Inventory schema for tracking physical items
const InventorySchema = new mongoose.Schema({
    // Basic information
    name: {
        type: String,
        required: true,
        trim: true
    },
    itemId: {
        type: String,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'pet_food',          // Dog/cat food, treats
            'medical_supply',     // Bandages, syringes, etc.
            'medication',         // Medicine, vitamins, etc.
            'cleaning_supply',    // Disinfectants, soap, etc.
            'shelter_equipment',  // Cages, beds, etc.
            'pet_accessory',      // Collars, leashes, etc.
            'office_supply',      // Paper, pens, etc.
            'donation_item',      // Items received as donations
            'other'               // Miscellaneous items
        ]
    },
    subcategory: {
        type: String,
        trim: true
    },

    // Quantity information
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        trim: true,
        default: 'pcs'
    },
    minimumStockLevel: {
        type: Number,
        default: 5
    },

    // Organization that owns this inventory
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Acquisition details
    source: {
        type: String,
        enum: ['purchased', 'donated', 'sponsored', 'other'],
        default: 'purchased'
    },
    // Reference to donation if this item came from a donation
    sourceDonation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        default: null
    },
    cost: {
        type: Number,
        min: 0,
        default: 0
    },

    // Important dates
    expiryDate: Date,
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    lastStockCheck: {
        type: Date,
        default: Date.now
    },

    // Additional info
    location: {
        type: String,
        trim: true,
        default: 'Main Storage'
    },
    notes: {
        type: String,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock'],
        default: 'in_stock'
    }
}, { timestamps: true });

// Generate unique itemId before saving
InventorySchema.pre('save', async function (next) {
    if (this.isNew) {
        // Format: INV-CATEGORY-TIMESTAMP-RANDOM
        const prefix = 'INV';
        const categoryCode = this.category.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.itemId = `${prefix}-${categoryCode}-${timestamp}-${random}`;
    }
    next();
});

// Update status based on quantity and minimumStockLevel
InventorySchema.pre('save', function (next) {
    if (this.quantity <= 0) {
        this.status = 'out_of_stock';
    } else if (this.quantity <= this.minimumStockLevel) {
        this.status = 'low_stock';
    } else {
        this.status = 'in_stock';
    }
    next();
});

// Create indexes for efficient querying
InventorySchema.index({ organization: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ expiryDate: 1 });
InventorySchema.index({ name: 'text' }); // Enable text search on item names

// Track inventory changes with a transaction log
const InventoryTransactionSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    transactionType: {
        type: String,
        required: true,
        enum: ['add', 'remove', 'adjust', 'stocktake', 'expire', 'transfer']
    },
    quantity: {
        type: Number,
        required: true
    },
    previousQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    reason: String,
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Optional reference to donation that triggered this transaction
    sourceDonation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    }
}, { timestamps: true });

// Create indexes for transaction log
InventoryTransactionSchema.index({ item: 1 });
InventoryTransactionSchema.index({ organization: 1 });
InventoryTransactionSchema.index({ transactionType: 1 });
InventoryTransactionSchema.index({ createdAt: 1 });

// Create the models
const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
const InventoryTransaction = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', InventoryTransactionSchema);

export { Inventory, InventoryTransaction };
export default Inventory;