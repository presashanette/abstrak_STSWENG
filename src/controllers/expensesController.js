const Expense = require('../models/Expense');

const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render('expenses', { expenses });
    } catch (err) {
        res.status(500).send(err);
    }
};

const addExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).send();
        }
        res.send(expense);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = {
    getAllExpenses,
    addExpense,
    updateExpense,
    deleteExpense
};
