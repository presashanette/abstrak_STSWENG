const OrderInfo = require('../models/OrderInfo');
const Product = require('../models/Product');
const multer = require('multer');
const { processCsvData } = require('../routes/loader');
const path = require('path');

let lastUpdatedDate = 'Never';

const storageCSV = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../models/data/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploadCSV = multer({ storage: storageCSV });

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const { sort, fulfillmentStatus, orderedFrom, paymentStatus, startDate, endDate } = req.query;

        // Build filter object
        let filter = {};
        if (fulfillmentStatus) {
            filter.fulfillmentStatus = fulfillmentStatus;
        }
        if (orderedFrom) {
            filter.orderedFrom = orderedFrom;
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (startDate || endDate) {
            filter.dateCreated = {};
            if (startDate) {
                filter.dateCreated.$gte = new Date(startDate).setHours(0, 0, 0, 0); // Start of the day
            }
            if (endDate) {
                filter.dateCreated.$lte = new Date(endDate).setHours(23, 59, 59, 999); // End of the day
            }
        }

        console.log('Filter:', filter);

        // Build sort object
        let sortOrder = {};
        if (sort) {
            if (sort === 'ordernumascending') {
                sortOrder.orderNumber = 1;
            } else if (sort === 'ordernumdescending') {
                sortOrder.orderNumber = -1;
            } else if (sort === 'orderdatelatest') {
                sortOrder.dateCreated = -1;
            } else if (sort === 'orderdateearliest') {
                sortOrder.dateCreated = 1;
            }
        }

        const totalOrders = await OrderInfo.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find(filter).sort(sortOrder).skip(skip).limit(limit).lean();
        console.log('Orders:', orders);

        const nextPage = page < totalPages ? page + 1 : null;

        console.log('Total Pages:', totalPages);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                orders,
                currentPage: page,
                totalPages, // Ensure totalPages is included in the response
            });
        } else {
            res.render('orders', {
                orders: JSON.stringify(orders),
                currentPage: page,
                totalPages,
                nextPage,
                lastUpdatedDate: new Date(), // Assuming this needs to be the current date
                "grid-add-button": "Order",
                "grid-title": "ORDERS"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};


async function addOrder(req, res) {
    const { orderNo, date, totalOrderQuantity, items, paymentStatus, paymentMethod, fulfillmentStatus, orderedFrom, shippingRate, totalPrice } = req.body;

    const newOrder = new OrderInfo({
        orderNumber: orderNo,
        dateCreated: date,
        totalOrderQuantity: totalOrderQuantity,
        items: items,
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        shippingRate: shippingRate,
        total: totalPrice,
        fulfillmentStatus: fulfillmentStatus,
        orderedFrom: orderedFrom
    });

    try {
        await newOrder.save();

        // Deduct inventory for each product in the order
        for (const item of items) {
            console.log(`Updating inventory for SKU: ${item.SKU}, Variation: ${item.variant}, Quantity: ${item.quantity}`);
            const product = await Product.findOneAndUpdate(
                { SKU: item.SKU, "variations.variation": item.variant },
                { $inc: { "variations.$.stocks": -item.quantity } },
                { new: true }
            );

            if (!product) {
                console.error(`Product with SKU: ${item.SKU} and Variation: ${item.variation} not found`);
            } else {
                console.log(`Updated product inventory: ${product}`);
            }
        }

        res.send({ success: true, message: 'Order added successfully' });
    } catch (err) {
        console.error("Error in add order: " + err);
        res.status(500).send('Server Error');
    }
}


const uploadCSVFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const csvFilePath = path.join(__dirname, '../models/data/', req.file.filename);
    try {
        await processCsvData(csvFilePath);
        lastUpdatedDate = new Date().toLocaleString();
        res.status(200).json({ message: 'File uploaded and processed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing CSV file: ' + error.message });
    }
};

async function getAnOrder(req, res) {
    const orderId = req.params.id;
    const orderIdStr = orderId.toString();
    console.log(orderIdStr);

    try {
        let order = await OrderInfo.find({'orderNumber': orderId}).lean();
        order = order[0];
        // console.log(order);
        // res.send(order);
        for (let item of order.items) {

            item.itemName = item.itemName.replaceAll('"', '');
            let product = await Product.findOne({"SKU": item.sku});
            // console.log(product);
            if(product !== null){
                item.picture = product.picture;
            }
        }

        console.log(order);
        res.send(order);


    }   catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

async function checkOrderNo(req, res) {
    const orderNo = req.query.orderNo;
    try {
        const existingOrder = await OrderInfo.findOne({ orderNumber: orderNo });
        if (existingOrder) {
            res.json({ success: false, message: 'Order Number is already taken.' });
            console.log("Order Number is already taken.");
        } else {
            res.json({ success: true, message: 'Order Number is available.' });
        }
    } catch (err) {
        console.error('Error checking order number:', err);
        res.status(500).json({ success: false, message: 'Server error while checking order number.' });
    }
}

module.exports = { getOrders, getAnOrder, uploadCSVFile, addOrder, uploadCSV, checkOrderNo };
