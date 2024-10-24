const mongoose = require('mongoose');

const mainFundSchema = new mongoose.Schema({
    balance: { type: Number, required: true },
    transactions: [
        {
            orderId: { type: String, default: null }, // Optional field for orders
            expenseId: { type: String, default: null }, // Optional field for expenses
            type: { type: String, required: true },
            amount: { type: Number, required: true },
            description: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = mongoose.model('MainFund', mainFundSchema);
