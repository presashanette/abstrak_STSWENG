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

      // Calculate trend data for all products
      const trendData = calculateTrendData(orderAggregations, overallMetrics.sellingPrice, overallMetrics.costPrice);
      console.log('trendData:', trendData);

      res.json({ overallMetrics, trendData });
  } catch (error) {
      console.error('Error fetching overall metrics:', error);
      res.status(500).send('Internal Server Error');
  }
}

function calculateOverallMetrics(orderAggregations) {
  let totalSold = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  let totalRefunded = 0;
  let grossProfit = 0;

  orderAggregations.forEach(agg => {
      const revenue = agg.netSold * agg.sellingPrice;
      const cost = agg.netSold * agg.costPrice;
      totalSold += agg.netSold;
      totalRevenue += revenue;
      totalCost += cost;
      totalRefunded += agg.totalRefunded;
      grossProfit += (agg.sellingPrice - agg.costPrice) * agg.netSold;
  });

  const returnRate = totalRefunded / (totalSold + totalRefunded) * 100;
  const profitMargin = (grossProfit / totalRevenue) * 100;

  return {
      totalSold,
      totalRefunded,
      totalRevenue,
      totalCost,
      grossProfit,
      returnRate,
      profitMargin
  };
}


function calculateTrendData(orderAggregations, sellingPrice, costPrice) {
  // Calculate sales over time by date
  const salesOverTime = orderAggregations.map(agg => ({
      date: agg.dateCreated,
      sales: agg.totalSold
  }));

  // Calculate profit over time by month
  const profitOverTime = orderAggregations.reduce((acc, agg) => {
      const monthYear = `${agg.dateCreated.getFullYear()}-${agg.dateCreated.getMonth() + 1}`;
      if (!acc[monthYear]) {
          acc[monthYear] = { date: new Date(agg.dateCreated.getFullYear(), agg.dateCreated.getMonth()), profit: 0 };
      }
      acc[monthYear].profit += (agg.totalSold * sellingPrice) - (agg.totalSold * costPrice);
      return acc;
  }, {});

  // Convert profitOverTime object to array
  const profitOverTimeArray = Object.values(profitOverTime);

  return { salesOverTime, profitOverTime: profitOverTimeArray };
}

module.exports = {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled};