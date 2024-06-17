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

        // console.log(`Request page: ${page}`);
        // console.log(`Total pages: ${totalPages}`);
        // console.log(initialOrders);  

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            // console.log('Sending JSON response');
            res.json({
                orders,
                currentPage: page,
                totalPages
            });
        } else {
            console.log('Rendering orders page');
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

    console.log("sample")
    console.log(req.body);

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

    console.log(newOrder);

    try{
        await newOrder.save();
        console.log(newOrder);
        res.send({ success: true, message: 'Order added successfully' });
        
    } catch (err) {
        console.log("error in add order: " + err)
    }
    
};


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
    }   catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

}

module.exports = { getOrders, getAnOrder, uploadCSVFile, addOrder, uploadCSV };
