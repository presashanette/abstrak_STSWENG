const OrderInfo = require("../models/OrderInfo");
const Product = require('../models/Product');
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

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled, getStocks};