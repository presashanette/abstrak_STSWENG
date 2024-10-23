const Expense = require('../models/Expense');
const Collection = require('../models/AbstrakCol');
const MainFund = require('../models/MainFund')


const getPaginatedExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const filter = await buildExpenseFilter(req.query);
        const sortOrder = buildSortOrder(req.query.sort);

        const totalExpenses = await Expense.countDocuments(filter);
        const totalPages = Math.ceil(totalExpenses / limit);

        const expenses = await Expense.find(filter).sort(sortOrder).skip(skip).limit(limit).lean();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                expenses,   // This will include `expenseId`
                currentPage: page,
                totalPages, // Ensure totalPages is included in the response
            });
        } else {
            res.render('expenses', {
                expenses: JSON.stringify(expenses),
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                lastUpdatedDate: new Date(),
            });
        }
    } catch (err) {
        console.error('Error fetching paginated expenses:', err);
        res.status(500).send('Server Error');
    }
};


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

const buildExpenseFilter = async (query) => {
    const { sort, paymentMethod, collection, category, startDate, endDate, quantityType, quantityValue } = query;

    let filter = {}; // Use 'let' to allow modifications
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
        console.log(`Filter by paymentMethod: ${paymentMethod}`);
    }
    if (collection) {
        filter.collectionName = collection;
        console.log(`Filter by collection: ${collection}`);
    }
    if (category) {
        filter.category = category;
        console.log(`Filter by category: ${category}`);
    }
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate).setHours(0, 0, 0, 0); // Start of the day
            console.log(`Filter by startDate: ${new Date(startDate).toISOString()}`);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate).setHours(23, 59, 59, 999); // End of the day
            console.log(`Filter by endDate: ${new Date(endDate).toISOString()}`);
        }
    }
    if (quantityType && quantityValue) {
        const parsedQuantityValue = parseInt(quantityValue, 10); // Ensure quantityValue is an integer
        switch (quantityType) {
            case 'lower':
                filter.quantity = { $lt: parsedQuantityValue };
                console.log(`Filter by quantity lower than: ${parsedQuantityValue}`);
                break;
            case 'higher':
                filter.quantity = { $gt: parsedQuantityValue };
                console.log(`Filter by quantity higher than: ${parsedQuantityValue}`);
                break;
            case 'equal':
                filter.quantity = { $eq: parsedQuantityValue };
                console.log(`Filter by quantity equal to: ${parsedQuantityValue}`);
                break;
            default:
                break;
        }
    }

    console.log('Final filter object:', filter);
    return filter;
};

const buildSortOrder = (sort) => {
    let sortOrder = {};
    if (sort) {
        if (sort === 'amountasc') {
            sortOrder.amount = 1;
            console.log('Sorting by amount ascending');
        } else if (sort === 'amountdesc') {
            sortOrder.amount = -1;
            console.log('Sorting by amount descending');
        } else if (sort === 'dateasc') {
            sortOrder.date = 1;
            console.log('Sorting by date ascending');
        } else if (sort === 'datedesc') {
            sortOrder.date = -1;
            console.log('Sorting by date descending');
        }
    } else {
        sortOrder.date = -1; // Default sort by date in descending order
        console.log('Default sorting by date descending');
    }

    return sortOrder;
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
        const expense = new Expense(req.body); // Expense will automatically have an incremented expenseId
        await expense.save();

        // Update the main fund by subtracting the expense amount
        await MainFund.findOneAndUpdate(
            {},
            {
                $inc: { balance: -expense.amount },
                $push: {
                    transactions: {
                        expenseId: expense.expenseId, // Include expenseId in main fund transaction
                        type: 'expense',
                        amount: expense.amount,
                        description: `Expense added: ${expense.name} - ${expense.collectionName}`
                    }
                }
            },
            { new: true, upsert: true }
        );

        res.status(201).send(expense);
    } catch (err) {
        res.status(400).send(err);
    }
};


const updateExpense = async (req, res) => {
    try {
        // Fetch the original expense for comparison
        const originalExpense = await Expense.findById(req.params.id);
        if (!originalExpense) {
            return res.status(404).send('Expense not found.');
        }

        // Calculate the original total cost (amount * quantity)
        const originalTotalCost = originalExpense.amount * originalExpense.quantity;

        // Update the expense object directly with new values from the request body
        originalExpense.name = req.body.name;
        originalExpense.collectionName = req.body.collectionName;
        originalExpense.date = req.body.date;
        originalExpense.amount = req.body.amount;
        originalExpense.quantity = req.body.quantity;
        originalExpense.paymentMethod = req.body.paymentMethod;
        originalExpense.category = req.body.category;
        originalExpense.description = req.body.description;
        originalExpense.receiptUrl = req.body.receiptUrl;

        // Calculate the updated total cost (amount * quantity)
        const updatedTotalCost = originalExpense.amount * originalExpense.quantity;

        // Calculate the difference between the updated and original total costs
        const costDifference = updatedTotalCost - originalTotalCost;

        // Save the updated expense object
        await originalExpense.save();

        // Fetch the specific transaction by _id (provided by you)
        const transactionId = "67162e02c89a0378e3ec41b0"; // Replace with the actual _id you're working with

        const mainFund = await MainFund.findOne();

        // Find the transaction in the main fund's transaction log
        const transactionIndex = mainFund.transactions.findIndex(transaction => transaction._id.toString() === transactionId);

        if (transactionIndex === -1) {
            return res.status(404).send('Transaction not found.');
        }

        // Update the specific transaction
        mainFund.transactions[transactionIndex].amount = costDifference; // Adjust the amount
        mainFund.transactions[transactionIndex].description = `Expense updated: ${originalExpense.name} - ${originalExpense.collectionName}`;
        
        // Manually adjust the balance based on the cost difference
        const updatedBalance = mainFund.balance - costDifference; // Subtract the difference directly

        // Save the updated main fund
        await mainFund.save();

        res.send(originalExpense); // Send back the updated expense
    } catch (err) {
        res.status(400).send(err.message);
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

const fetchExpenseGraphs = async (req, res) => {
    try {
        // Fetch all expenses
        const expenses = await Expense.find({}).lean();
        console.log('All Expenses:', expenses);

        // Perform the aggregation for expenses by category
        const expenseAggregations = await Expense.aggregate([
            { $project: {
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: '$category',
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                category: '$_id',
                totalAmount: 1
            }},
            { $sort: { totalAmount: -1 } }
        ]);

        console.log('Expenses by Category:', expenseAggregations);

        // Perform the aggregation for expenses by collection and category
        const collectionAggregations = await Expense.aggregate([
            { $project: {
                collectionName: 1,
                category: 1,
                totalCost: { $multiply: ['$amount', '$quantity'] }
            }},
            { $group: {
                _id: { collectionName: '$collectionName', category: '$category' },
                totalAmount: { $sum: '$totalCost' }
            }},
            { $project: {
                _id: 0,
                collectionName: '$_id.collectionName',
                category: '$_id.category',
                totalAmount: 1
            }},
            { $sort: { collectionName: 1, totalAmount: -1 } }
        ]);

        console.log('Expenses by Collection and Category:', collectionAggregations);

        res.json({ expenseAggregations, collectionAggregations });
    } catch (error) {
        console.error('Error fetching expense data:', error);
        res.status(500).send('Internal Server Error');
    }
}

// No need for date range helper function since we are fetching all data




module.exports = {
    getPaginatedExpenses,
    getAllCollections,
    getAllExpenses,
    getExpense,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchExpenseGraphs
};
