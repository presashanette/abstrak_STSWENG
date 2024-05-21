const { Schema, model } = require('mongoose');

const expenseSchema = new Schema ({
    product: {type: Schema.Types.ObjectId, required: true},
    collectionName: {type: Schema.Types.ObjectId, required: true},
    date: {type: Date, required: true},
    amount: {type: Number, required: true},
    paymentMethod: {type: String, required: true},
})

const Expense = model('expense', expenseSchema)

module.exports = Expense;