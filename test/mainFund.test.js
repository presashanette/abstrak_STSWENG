const mockingoose = require("mockingoose");
const { addExpense } = require("../src/controllers/ExpensesController");
const Expense = require("../src/models/Expense");
const MainFund = require("../src/models/MainFund");

describe("addExpense Controller", () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = {
      body: {
        name: "Office Supplies",
        collectionName: "Office Budget",
        date: new Date(),
        amount: 100,
        quantity: 5,
        paymentMethod: "Credit",
        category: "Office",
        description: "Stationery and other supplies",
      },
      session: {
        username: "Abstrak_Admin",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should correctly add an expense and update the MainFund balance", async () => {
    const savedExpense = {
      _id: "67446c3707fb5422e3309417",
      expenseId: "67446c3707fb5422e3309418",
      ...req.body,
    };
    mockingoose(Expense).toReturn(savedExpense, "save");

    const updatedMainFund = {
      balance: 450,
      transactions: [
        {
          expenseId: "67446c3707fb5422e3309418",
          type: "expense",
          amount: 500,
          description: `Expense added: ${req.body.name} - ${req.body.collectionName}`,
        },
      ],
    };
    mockingoose(MainFund).toReturn(updatedMainFund, "findOneAndUpdate");

    await addExpense(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: req.body.amount,
        category: req.body.category,
        collectionName: req.body.collectionName,
        description: req.body.description,
        name: req.body.name,
        paymentMethod: req.body.paymentMethod,
        quantity: req.body.quantity,
      })
    );
  });
});
