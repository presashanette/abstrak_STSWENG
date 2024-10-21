const OrderInfo = require("../models/OrderInfo");

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

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled};