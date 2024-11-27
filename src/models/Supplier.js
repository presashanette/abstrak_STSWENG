const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactInfo: { type: String, required: true },
    address: { type: String, required: true },
    productsSupplied: [{
        productName: { type: String, required: true }, // Name of the product
        category: { 
            type: String, 
            enum: ['Fabric', 'Apparel', 'Miscellaneous', 'Other'], 
            required: true 
        }, // General category
        subCategory: { type: String }, // Specific subcategory (e.g., Cotton, Caps, Refreshers)
        price: { type: Number, required: true }, // Price of the product
        stocksSupplied: { type: Number, required: true }, // Quantity supplied
    }],
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` on save
supplierSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Supplier', supplierSchema);
