const Expense = require("../src/models/Expense");
const MainFund = require("../src/models/MainFund");
const { addExpense } = require("../src/controllers/expensesController");

jest.mock("../src/models/Expense");
jest.mock("../src/models/MainFund");

describe("addExpense", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        amount: 100,
        name: "Test Expense",
        collectionName: "Test Collection",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const mockExpense = {
      expenseId: 1,
      ...req.body,
      save: jest.fn().mockResolvedValue({ expenseId: 1 }), 
    };

    Expense.mockImplementation(() => mockExpense);

    MainFund.findOneAndUpdate = jest.fn().mockResolvedValue({
      balance: 900,
      transactions: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should add an expense and update the main fund successfully", async () => {
    await addExpense(req, res);

    expect(Expense).toHaveBeenCalledWith(req.body);

    expect(MainFund.findOneAndUpdate).toHaveBeenCalledWith(
      {},
      {
        $inc: { balance: -req.body.amount },
        $push: {
          transactions: {
            expenseId: 1,
            type: "expense",
            amount: req.body.amount,
            description: `Expense added: ${req.body.name} - ${req.body.collectionName}`,
          },
        },
      },
      { new: true, upsert: true }
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        expenseId: 1,
        amount: req.body.amount,
        name: req.body.name,
        collectionName: req.body.collectionName,
      })
    );
  });
});
