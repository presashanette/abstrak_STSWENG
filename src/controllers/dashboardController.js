const OrderInfo = require("../models/OrderInfo");
const Product = require('../models/Product');
const Reminder = require('../models/Reminders');

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
    const reminders = await Reminder.find({ });
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
    
    newReminder.save();
    res.send({ succesful: true, message: "New reminder created."})
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Errror.");
  }
}

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled, getStocks, getReminders, addReminder };