// In expensesController.js
const Expense = require('../models/Expense');
const Collection = require('../models/AbstrakCol');

const getAllCollections = async (req, res) => {
    try {
        const collections = await Collection.find({}).lean();
        res.json(collections);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.render('expenses', { expenses });
    } catch (err) {
        res.status(500).send(err);
    }
};

const getExpense = async (req, res) => {
    const expenseId = req.params.id;
    console.log(`Received request to get expense with ID: ${expenseId}`);

    try {
        let expense = await Expense.findById(expenseId).lean();
        
        if (!expense) {
            console.log(`Expense with ID: ${expenseId} not found.`);
            return res.status(404).send('Expense not found');
        }

        console.log(`Expense retrieved: ${JSON.stringify(expense)}`);
        res.send(expense);
    } catch (err) {
        console.error(`Error retrieving expense with ID: ${expenseId}`, err);
        res.status(500).send('Server Error');
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
    getAllCollections,
    getAllExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense
};
