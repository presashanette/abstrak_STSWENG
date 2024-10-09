// src/models/MainFund.js

const mongoose = require('mongoose');

const mainFundSchema = new mongoose.Schema({
    balance: { type: Number, default: 0 },
    transactions: [
        {
            type: { type: String, required: true }, // e.g., 'order' or 'expense'
            amount: { type: Number, required: true },
            description: { type: String, required: false },
            date: { type: Date, default: Date.now },
            orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderInfo' }, // Reference to OrderInfo if transaction is an order
            expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }  // Reference to Expense if transaction is an expense
        }
    ]
});

module.exports = mongoose.model('MainFund', mainFundSchema);
