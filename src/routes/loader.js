const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');
const OrderInfo = require('../models/OrderInfo');
const Sales = require('../models/Sales');
const fs = require('fs')
const csv = require('csv-parser');


const collectionsJson = "src/models/data/data-abstrakcols.json";
const productsJson = "src/models/data/data-products.json";


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
        const order = await OrderInfo.findOne({ orderNo: sale.orderNo.trim() });
  
        if (order) {
          order.items.push({
            name: sale.name,
            quantity: sale.qty,
            variant: sale.variant,
            sku: sale.sku || '' 
          });
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
    const orderCsvFilePath = 'src/models/data/Orders.csv';
    const salesCsvFilePath = 'src/models/data/Sales.csv';
  
    try {
      // Clear existing data
      await OrderInfo.deleteMany({});
      await Sales.deleteMany({});
      console.log('Existing orders and sales data cleared');
  
      const orderPromises = [];
      const salesPromises = [];
  
      // Process OrderInfo
      fs.createReadStream(orderCsvFilePath)
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (row) => {
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
              total: total,
              items: []
            });
  
            orderPromises.push(
              order.save()
                .then(() => console.log('Order saved'))
                .catch((err) => console.error('Error saving order:', err))
            );
          } else {
            console.error('Invalid total order quantity or total value:', row['Total order quantity'], row['Total']);
          }
        })
        .on('end', async () => {
          console.log('Order CSV file successfully processed');
          await Promise.all(orderPromises);
  
          // Process Sales
          fs.createReadStream(salesCsvFilePath)
            .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => {
              console.log('Sales row data:', row);
              const quantity = parseInt(row['Qty']);
              if (!isNaN(quantity)) {
                const sale = new Sales({
                  orderNo: row['Order number'].trim(),
                  name: row['Item'],
                  qty: quantity,
                  sku: row['SKU'] ? row['SKU'].trim() : '',
                  variant: row['Variant']
                });
  
                salesPromises.push(
                  sale.save()
                    .then(() => console.log('Sale saved'))
                    .catch((err) => console.error('Error saving sale:', err))
                );
              } else {
                console.error('Invalid quantity value:', row['Qty']);
              }
            })
            .on('end', async () => {
              await Promise.all(salesPromises);
              console.log('Sales CSV file successfully processed');
              await associateSalesWithOrders();
            })
            .on('error', (error) => {
              console.error('Error reading the Sales CSV file:', error);
            });
        })
        .on('error', (error) => {
          console.error('Error reading the Order CSV file:', error);
        });
  
    } catch (error) {
      console.error('Error processing CSV data:', error);
    }
  }

module.exports = { loadCollections, loadProducts, processCsvData};