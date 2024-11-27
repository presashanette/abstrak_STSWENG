const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');
const OrderInfo = require('../models/OrderInfo');
const Voucher = require('../models/Voucher');
// const Sales = require('../models/Sales');
const User = require('../models/User'); 
const fs = require('fs');
const csv = require('csv-parser');
const Audit = require('../models/Audit');
const Reminder = require('../models/Reminders');
const MainFund = require('../models/MainFund'); 

const collectionsJson = "src/models/data/data-abstrakcols.json";
const productsJson = "src/models/data/data-products.json";
const voucherJson = "src/models/data/data-vouchers.json"; 
const usersJson = "src/models/data/data-users.json";
const auditJson = "src/models/data/data-audit.json";

function parseJson(pathToJson) {
  return JSON.parse(fs.readFileSync(pathToJson));
}

async function loadCollections() {
  const result = parseJson(collectionsJson);
  await Collection.deleteMany({}).then(() => {
    Collection.insertMany(result);
  });
}

async function loadProducts() {
  const result = parseJson(productsJson);
  await Product.deleteMany({}).then(() => {
    Product.insertMany(result);
  });
}

async function loadVouchers() {
  const result = parseJson(voucherJson);
  console.log('Voucher data:', result); // Log the parsed voucher data
  await Voucher.deleteMany({}).then(() => {
    Voucher.insertMany(result);
  });
}

async function loadUsers() {
  const result = parseJson(usersJson);
  await User.deleteMany({});
  for (const userData of result) {
    const user = new User(userData);
    await user.save();
  }
}

async function loadAudit() {
    const result = parseJson(auditJson);
    await Audit.deleteMany({}).deleteMany({}).then(() => {
        Audit.insertMany(result);
      });
}

async function loadReminder() {
    const result = parseJson(auditJson);
    await Reminder.deleteMany({}).deleteMany({}).then(() => {
        Reminder.insertMany(result);
      });
}

/*async function processCsvData(csvFilePath) {
  try {
      // Clear data
      await OrderInfo.deleteMany({});
      console.log('Existing orderInfos data cleared');

      const orders = {};

      fs.createReadStream(csvFilePath)
          .pipe(csv({
              mapHeaders: ({ header }) => header.trim()
          }))
          .on('data', (row) => {
              const orderNumber = row['Order number'];
              if (!orders[orderNumber]) {
                  orders[orderNumber] = {
                      orderNumber,
                      dateCreated: new Date(row['Date created']),
                      time: row['Time'],
                      fulfillBy: row['Fulfill by'],
                      totalOrderQuantity: parseInt(row['Total order quantity'], 10),
                      items: [],
                      paymentStatus: row['Payment status'],
                      paymentMethod: row['Payment method'],
                      couponCode: row['Coupon code'],
                      giftCardAmount: parseFloat(row['Gift card amount']) || 0,
                      shippingRate: parseFloat(row['Shipping rate']),
                      totalTax: parseFloat(row['Total tax']),
                      total: parseFloat(row['Total']),
                      currency: row['Currency'],
                      refundedAmount: parseFloat(row['Refunded amount']) || 0,
                      netAmount: parseFloat(row['Net amount']),
                      additionalFees: parseFloat(row['Additional fees']) || 0,
                      fulfillmentStatus: row['Fulfillment status'],
                      trackingNumber: row['Tracking number'],
                      fulfillmentService: row['Fulfillment service'],
                      deliveryMethod: row['Delivery method'],
                      shippingLabel: row['Shipping label'],
                      orderedFrom: 'WIX website',
                  };
              }

              orders[orderNumber].items.push({
                  itemName: row['Item'],
                  variant: row['Variant'],
                  sku: row['SKU'],
                  quantity: parseInt(row['Qty'], 10),
                  quantityRefunded: parseInt(row['Quantity refunded'], 10),
                  price: parseFloat(row['Price']),
                  weight: parseFloat(row['Weight']),
                  customText: row['Custom text'],
                  depositAmount: parseFloat(row['Deposit amount']) || 0,
                  deliveryTime: row['Delivery time'],
              });
          })
          .on('end', async () => {
              console.log('Order CSV file successfully processed');
              for (const orderData of Object.values(orders)) {
                  const order = new OrderInfo(orderData);
                  await order.save().then(() => {
                      console.log(`Order ${orderData.orderNumber} saved`);
                  }).catch((err) => {
                      console.error('Error saving order:', err);
                  });
              }
          })
          .on('error', (error) => {
              console.error('Error reading the Order CSV file:', error);
          });

  } catch (error) {
      console.error('Error processing CSV data:', error);
  }
}*/

async function processCsvData(csvFilePath) {
    return new Promise((resolve, reject) => {
        try {
            // Clear existing OrderInfo data
            OrderInfo.deleteMany({})
                .then(() => console.log('Existing orderInfos data cleared'))
                .catch(err => console.error('Error clearing orderInfos data:', err));

            const orders = {};

            fs.createReadStream(csvFilePath)
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim()
                }))
                .on('data', (row) => {
                    const orderNumber = row['Order number'];
                    if (!orders[orderNumber]) {
                        orders[orderNumber] = {
                            orderNumber,
                            dateCreated: new Date(row['Date created']),
                            totalOrderQuantity: parseInt(row['Total order quantity'], 10),
                            items: [],
                            paymentStatus: row['Payment status'],
                            paymentMethod: row['Payment method'],
                            shippingRate: parseFloat(row['Shipping rate']),
                            total: parseFloat(row['Total']),
                            fulfillmentStatus: row['Fulfillment status'],
                            orderedFrom: 'WIX website',
                        };
                    }

                    orders[orderNumber].items.push({
                        itemName: row['Item'],
                        variant: row['Variant'],
                        sku: row['SKU'],
                        quantity: parseInt(row['Qty'], 10),
                        price: parseFloat(row['Price']),
                    });
                })
                .on('end', async () => {
                    console.log('Order CSV file successfully processed');
                    const savedOrders = [];

                    for (const orderData of Object.values(orders)) {
                        const existingOrder = await OrderInfo.findOne({ orderNumber: orderData.orderNumber });
                        if (existingOrder) {
                            console.log(`Order ${orderData.orderNumber} already exists. Skipping duplicate.`);
                            continue;
                        }

                        const order = new OrderInfo(orderData);
                        await order.save();
                        console.log(`Order ${orderData.orderNumber} saved`);
                        savedOrders.push(order);

                        // Verify if transaction already exists for this order in MainFund
                        const mainFund = await MainFund.findOne({ 
                            'transactions.description': `Order #${orderData.orderNumber} imported from CSV` 
                        });

                        if (mainFund) {
                            console.log(`Transaction for Order ${orderData.orderNumber} already exists in MainFund. Skipping duplicate.`);
                            continue;
                        }

                        // Add a unique transaction to MainFund
                        await MainFund.findOneAndUpdate(
                            {},
                            {
                                $inc: { balance: orderData.total },
                                $push: {
                                    transactions: {
                                        type: 'order',
                                        amount: orderData.total,
                                        description: `Order #${orderData.orderNumber} imported from CSV`,
                                        orderId: order._id,
                                    }
                                }
                            },
                            { new: true, upsert: true }
                        );

                        console.log(`Transaction added for Order ${orderData.orderNumber} in MainFund`);
                    }

                    resolve(savedOrders); // Resolve with all saved orders
                })
                .on('error', (error) => {
                    console.error('Error reading the Order CSV file:', error);
                    reject(error);
                });

        } catch (error) {
            console.error('Error processing CSV data:', error);
            reject(error);
        }
    });
}




module.exports = { loadCollections, loadProducts, loadUsers, processCsvData, loadVouchers,  loadAudit, loadReminder };
