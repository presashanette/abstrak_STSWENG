const OrderInfo = require("../models/OrderInfo");
const Product = require('../models/Product');
const Reminder = require('../models/Reminders');
const MainFund = require("../models/MainFund");

async function getMainFundBalance(req, res) {
    try {
        const mainFund = await MainFund.findOne();
        if (!mainFund) {
            return res.status(404).json({ message: 'MainFund not found' });
        }
        res.json({ balance: mainFund.balance });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports = { getMainFundBalance };


async function getOrdersUnfulfilled(req, res) {
  try {
    const orders = await OrderInfo.find({fulfillmentStatus: 'Unfulfilled'}).lean().countDocuments();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getOrdersFulfilled(req, res) {
  try {
    const orders = await OrderInfo.find({fulfillmentStatus: 'Fulfilled'}).lean().countDocuments();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}


async function getOrdersCancelled(req, res) {
  try {
    const orders = await OrderInfo.find({fulfillmentStatus: 'Canceled'}).lean().countDocuments();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getStocks(req, res) {
  try {
    const lowStockProducts = await Product.find({
      variations: {
        $elemMatch: {
          stocks: {$lte: 5}
        }
      }
    }).lean();

    console.log(lowStockProducts);

    const formattedProducts = lowStockProducts.flatMap(product =>
        product.variations
            .filter(variation => variation.stocks <= 5)
            .map(variation => ({
              sku: product.SKU,
              name: `${product.name} (${variation.variation})`,
              stocks: variation.stocks
            }))
    );

    console.log(formattedProducts);

    res.json(formattedProducts);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

async function getReminders(req, res) {
  try {
    const reminders = await Reminder.find({ }).lean();
    console.log(reminders);
    res.send(reminders);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Errror.");
  }
}

async function addReminder(req, res) {
  try {
    const { description } = req.body;

    const newReminder = new Reminder({
      description
    });
    
    await newReminder.save();

    const reminders = await Reminder.find({ }).lean();

    res.send(reminders);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Errror.");
  }
}

async function deleteReminder(req, res) {
  try {
    const { alertId } = req.params;

    // Attempt to find and delete the reminder by alertId
    const result = await Reminder.findByIdAndDelete(alertId);

    if (!result) {
        return res.status(404).send({ message: 'Reminder not found.' });
    }

    // Get the updated list of reminders and send it back to the frontend
    const reminders = await Reminder.find({}).lean();
    res.send(reminders); // Send updated list of reminders after deletion
  } catch (err) {
      console.error('Error deleting reminder:', err);
      res.status(500).send('Server error.');
  }
}

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled, getStocks, getReminders, addReminder, deleteReminder };