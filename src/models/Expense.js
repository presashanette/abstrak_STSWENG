// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    expenseId: { type: Number, unique: true }, // New expenseId field
    name: { type: String, required: true },
    collectionName: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    receiptUrl: { type: String, required: false }
});

// Pre-save hook to increment expenseId
expenseSchema.pre('save', async function (next) {
    if (this.isNew) {  // Only increment for new documents
        const lastExpense = await this.constructor.findOne().sort({ expenseId: -1 });
        this.expenseId = lastExpense ? lastExpense.expenseId + 1 : 1; // Start from 1 if none found
    }
    next();
});

module.exports = mongoose.model('Expense', expenseSchema);
