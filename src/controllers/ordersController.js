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
        
        const totalOrders = await OrderInfo.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find().skip(skip).limit(limit).lean();
        const initialOrders = page === 1 ? orders : [];
        const nextPage = page < totalPages ? page + 1 : null;

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                orders,
                currentPage: page,
                totalPages
            });
        } else {
            res.render('orders', {
                orders: JSON.stringify(orders),
                initialOrders,
                currentPage: page,
                totalPages,
                nextPage,
                lastUpdatedDate,
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
        console.log(order);
    } catch (err) {
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
