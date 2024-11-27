const { json } = require("express");
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

async function getSalesMetric(req, res) {
  try {
      // Aggregate order information across all products
      const orderAggregations = await OrderInfo.aggregate([
          { $unwind: '$items' },
          { $project: {
              cleanedItemName: { $toLower: { $replaceAll: { input: '$items.itemName', find: '"', replacement: '' } } },
              itemName: '$items.itemName',
              variant: '$items.variant',
              quantity: '$items.quantity',
              quantityRefunded: '$items.quantityRefunded',
              sellingPrice: '$items.price',
              costPrice: '$items.costPrice',
              dateCreated: '$dateCreated'
          }},
          { $group: {
              _id: { variant: '$variant', dateCreated: { $dateToString: { format: "%Y-%m", date: "$dateCreated" } } },
              totalSold: { $sum: '$quantity' },
              totalRefunded: { $sum: '$quantityRefunded' },
              netSold: { $sum: { $subtract: ['$quantity', '$quantityRefunded'] }},
              sellingPrice: { $first: '$sellingPrice' }, 
              costPrice: { $first: '$costPrice' }, 
              dateCreated: { $first: '$dateCreated' }
          }},
          { $project: {
              _id: 0,
              variant: '$_id.variant',
              totalSold: 1,
              totalRefunded: 1,
              netSold: 1,
              sellingPrice: 1, 
              costPrice: 1, 
              dateCreated: 1
          }},
          { $sort: { dateCreated: 1 } } // Sort by date for trend analysis
      ]);

      console.log('orderAggregations:', orderAggregations);

      // Calculate overall metrics across all products
      const overallMetrics = calculateOverallMetrics(orderAggregations);
      console.log("Metrics: " + JSON.stringify(overallMetrics));

      // Calculate trend data for all products
      const trendData = calculateTrendData(orderAggregations);
      console.log('trendData:', trendData);

      res.json({ trendData });
  } catch (error) {
      console.error('Error fetching overall metrics:', error);
      res.status(500).send('Internal Server Error');
  }
}

function calculateOverallMetrics(orderAggregations) {
  let netSold = 0;
  let netRevenue = 0;
  let netCost = 0;
  let netRefunded = 0;
  let grossProfit = 0;

  orderAggregations.forEach(agg => {
      const revenue = agg.totalSold * agg.sellingPrice;
      const cost = agg.totalSold * agg.costPrice;
      netSold += agg.totalSold;
      netRevenue += revenue;
      netCost += cost;
      netRefunded += agg.totalRefunded;
      grossProfit += (agg.sellingPrice - agg.costPrice) * agg.totalSold;
  });

  const returnRate = netRefunded / (netSold + netRefunded) * 100;
  const profitMargin = (grossProfit / netRevenue) * 100;

  return {
      netSold,
      netRefunded,
      netRevenue,
      netCost,
      grossProfit,
      returnRate,
      profitMargin
  };
}

function calculateTrendData(orderAggregations) {
  // Calculate sales over time by month
  const salesOverTime = orderAggregations.reduce((acc, agg) => {
      const monthYear = `${agg.dateCreated.getFullYear()}-${agg.dateCreated.getMonth() + 1}`; // Format as "YYYY-M"
      if (!acc[monthYear]) {
          acc[monthYear] = { date: monthYear, sales: 0 };
      }
      acc[monthYear].sales += agg.totalSold;
      return acc;
  }, {});

  // Convert salesOverTime object to an array
  const salesOverTimeArray = Object.values(salesOverTime);

  // Calculate profit over time by month
  const profitOverTime = orderAggregations.reduce((acc, agg) => {
      const monthYear = `${agg.dateCreated.getFullYear()}-${agg.dateCreated.getMonth() + 1}`; // Format as "YYYY-M"
      if (!acc[monthYear]) {
          acc[monthYear] = { date: monthYear, profit: 0 };
      }
      acc[monthYear].profit += agg.totalSold * (agg.sellingPrice - agg.costPrice); // TO FOLLOW, PLS FIND A WAY TO CALCULATE COST
      return acc;
  }, {});

  // Convert profitOverTime object to an array
  const profitOverTimeArray = Object.values(profitOverTime);

  // Calculate profit over time by month
  const revenueOverTime = orderAggregations.reduce((acc, agg) => {
      const monthYear = `${agg.dateCreated.getFullYear()}-${agg.dateCreated.getMonth() + 1}`; // Format as "YYYY-M"
      if (!acc[monthYear]) {
          acc[monthYear] = { date: monthYear, revenue: 0 };
      }
      acc[monthYear].revenue += agg.totalSold * agg.sellingPrice;
      return acc;
  }, {});

  // Convert profitOverTime object to an array
  const revenueOverTimeOverTimeArray = Object.values(revenueOverTime);

  return { salesOverTime: salesOverTimeArray, profitOverTime: profitOverTimeArray, revenueOverTime: revenueOverTimeOverTimeArray };
}

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled, getSalesMetric};