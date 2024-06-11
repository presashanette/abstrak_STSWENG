const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');
const OrderInfo = require('../models/OrderInfo');
// const Sales = require('../models/Sales');
const fs = require('fs');
const csv = require('csv-parser');

const collectionsJson = "src/models/data/data-abstrakcols.json";
const productsJson = "src/models/data/data-products.json";

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


// async function associateSalesWithOrders() {
//   try {
//     const salesRecords = await Sales.find({});
    
//     for (const sale of salesRecords) {
//       const order = await OrderInfo.findOne({ orderNumber: sale.orderNo });
      
//       if (order) {
//         order.items.push({ name: sale.name, quantity: sale.qty });
//         await order.save();
//         console.log(`Updated order ${order.orderNumber} with item ${sale.name}`);
//       } else {
//         console.warn(`No order found with orderNumber: ${sale.orderNo}`);
//       }
//     }
    
//     console.log('Sales association with orders completed.');
//   } catch (error) {
//     console.error('Error associating sales with orders:', error);
//   }
// }


async function processCsvData() {
  const orderCsvFilePath = `src/models/data/full-order.csv`;

  try {
    // Clear data
    await OrderInfo.deleteMany({});
    // await Sales.deleteMany({});
    console.log('Existing orders and sales data cleared');

    const orders = {};

    // OrderInfo
    fs.createReadStream(orderCsvFilePath)
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
            contactEmail: row['Contact email'],
            noteFromCustomer: row['Note from customer'],
            additionalCheckoutInfo: row['Additional checkout info'],
            items: [],
            deliveryAddress: {
              name: row['Recipient name'],
              phone: row['Recipient phone'],
              companyName: row['Recipient company name'],
              country: row['Delivery country'],
              state: row['Delivery state'],
              city: row['Delivery city'],
              address: row['Delivery address'],
              zip: row['Delivery zip/postal code'],
            },
            billingAddress: {
              name: row['Billing name'],
              phone: row['Billing phone'],
              companyName: row['Billing company name'],
              country: row['Billing country'],
              state: row['Billing state'],
              city: row['Billing city'],
              address: row['Billing address'],
              zip: row['Billing zip/postal code'],
            },
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
            shippingLabel: row['Shipping label'],
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
          deliveryMethod: row['Delivery method'],
          deliveryTime: row['Delivery time'],
        });
      })
      .on('end', async () => {
        console.log('Order CSV file successfully processed');
        for (const orderData of Object.values(orders)) {
          const order = new OrderInfo(orderData);
          await order.save().then(() => {
            // console.log(`Order ${orderData.orderNumber} saved`);
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
}

module.exports = { loadCollections, loadProducts, processCsvData };
