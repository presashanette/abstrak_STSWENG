const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');
const OrderInfo = require('../models/OrderInfo');
const Sales = require('../models/Sales');
const fs = require('fs')
const csv = require('csv-parser');


const collectionsJson = "src/models/data/data-abstrakcols.json";
const productsJson = "src/models/data/data-products.json";
// const orderscsv = "src/models/data/abstrak-orders.csv";
// const orderscsv = "src/models/data/Orders.csv";
// const Salescsv = "src/models/data/Sales.csv";





function parseJson(pathToJson){
    return JSON.parse(fs.readFileSync(pathToJson))
}


async function loadCollections() {
    result = parseJson(collectionsJson)
    await Collection.deleteMany({}).then(() => {
        Collection.insertMany(result)
    });
}


async function loadProducts() {
    result = parseJson(productsJson)
    await Product.deleteMany({}).then(() => {
        Product.insertMany(result)
    });
}


async function associateSalesWithOrders() {
  try {
    const salesRecords = await Sales.find({});
    
    for (const sale of salesRecords) {
      const order = await OrderInfo.findOne({ orderNo: sale.orderNo });
      
      if (order) {
        order.items.push({ name: sale.name, quantity: sale.qty });
        await order.save();
        console.log(`Updated order ${order.orderNo} with item ${sale.name}`);
      } else {
        console.warn(`No order found with orderNo: ${sale.orderNo}`);
      }
    }
    
    console.log('Sales association with orders completed.');
  } catch (error) {
    console.error('Error associating sales with orders:', error);
  }
}


async function processCsvData() {
  const orderCsvFilePath = `src/models/data/Orders.csv`; 
  const salesCsvFilePath = `src/models/data/Sales.csv`; 

  try {
    // Clear data
    await OrderInfo.deleteMany({});
    await Sales.deleteMany({});
    console.log('Existing orders and sales data cleared');

    const results = [];
    let totalRecords = 0;
    let savedRecords = 0;
    let failedRecords = 0;

    //OrderInfo
    fs.createReadStream(orderCsvFilePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (row) => {
        totalRecords++;
        console.log('Order row data:', row);
        const totalOrderQuantity = parseInt(row['Total order quantity']);
        const total = parseFloat(row['Total']);
        if (!isNaN(totalOrderQuantity) && !isNaN(total)) {
          const order = new OrderInfo({
            orderNo: row['Order no.'].trim(),
            date: new Date(row['Date']),
            totalOrderQuantity: totalOrderQuantity,
            paymentStatus: row['Payment status'],
            paymentMethod: row['Payment method'],
            fulfillmentStatus: row['Fulfillment status'],
            total: total
          });

          results.push(order.save()
            .then(() => {
              console.log('Order saved');
              savedRecords++;
            })
            .catch((err) => {
              console.error('Error saving order:', err);
              failedRecords++;
            }));
        } else {
          console.error('Invalid total order quantity or total value:', row['Total order quantity'], row['Total']);
          failedRecords++;
        }
      })
      .on('end', async () => {
        console.log('Order CSV file successfully processed');
      })
      .on('error', (error) => {
        console.error('Error reading the Order CSV file:', error);
      });

    fs.createReadStream(salesCsvFilePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }))
      .on('data', (row) => {
        console.log('Sales row data:', row);
        const quantity = parseInt(row['Qty']);
        if (!isNaN(quantity)) {
          const sale = new Sales({
            orderNo: row['Order no.'].trim(),
            name: row['Item'],
            qty: quantity
          });

          results.push(sale.save()
            .then(() => {
              console.log('Sale saved');
              savedRecords++;
            })
            .catch((err) => {
              console.error('Error saving sale:', err);
              failedRecords++;
            }));
        } else {
          console.error('Invalid quantity value:', row['Qty']);
          failedRecords++;
        }
      })
      .on('end', async () => {
        await Promise.all(results);
        console.log(`Sales CSV file successfully processed. Total Records: ${totalRecords}, Saved Records: ${savedRecords}, Failed Records: ${failedRecords}`);
        await associateSalesWithOrders();
      })
      .on('error', (error) => {
        console.error('Error reading the Sales CSV file:', error);
      });

  } catch (error) {
    console.error('Error processing CSV data:', error);
  }

  associateSalesWithOrders();
}

module.exports = { loadCollections, loadProducts, processCsvData};