const OrderInfo = require('../models/OrderInfo');
const Product = require('../models/Product');
const multer = require('multer');
const { processCsvData } = require('../routes/loader');
const path = require('path');
const Audit = require('../models/Audit');

const MainFund = require('../models/MainFund'); // Ensure the main fund model is imported

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

        const { searchText, sort, fulfillmentStatus, orderedFrom, paymentStatus, startDate, endDate } = req.query;

        // Build filter object
        let filter = {};

        // Add search condition
        if (searchText) {
            filter = {
                $or: [
                    { orderNumber: { $regex: searchText, $options: 'i' } },
                    { orderedFrom: { $regex: searchText, $options: 'i' } },
                    { paymentMethod: { $regex: searchText, $options: 'i' } },
                ],
            };
        }

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
                filter.dateCreated.$gte = new Date(startDate).setHours(0, 0, 0, 0);
            }
            if (endDate) {
                filter.dateCreated.$lte = new Date(endDate).setHours(23, 59, 59, 999);
            }
        }

        // Define sortOrder based on the 'sort' query parameter
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
        } else {
            sortOrder.dateCreated = -1; // Default sort: latest orders first
        }

        const totalOrders = await OrderInfo.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find(filter).sort(sortOrder).skip(skip).limit(limit).lean();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                orders,
                currentPage: page,
                totalPages,
            });
        } else {
            res.render('orders', {
                orders: JSON.stringify(orders),
                currentPage: page,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                lastUpdatedDate: new Date(),
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};



async function addOrder(req, res) {
    const { orderNo, date, totalOrderQuantity, items, paymentStatus, paymentMethod, fulfillmentStatus, orderedFrom, shippingRate, totalPrice } = req.body;

    // Check if the order number already exists
    const existingOrder = await OrderInfo.findOne({ orderNumber: orderNo });
    if (existingOrder) {
        console.log(`Order Number ${orderNo} already exists.`);
        return res.status(400).json({ success: false, message: 'Order Number already exists. Please use a different order number.' });
    }

    // Create the new order
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
        // Save the order to the database
        await newOrder.save();

        // Only update main fund if payment status is not 'unpaid'
        if (paymentStatus.toLowerCase() !== 'unpaid') {
            // Log the order as a transaction in MainFund and update balance
            const mainFund = await MainFund.findOneAndUpdate(
                {},
                { 
                    $inc: { balance: totalPrice }, // Increment main fund by order total
                    $push: { 
                        transactions: { 
                            type: 'order', 
                            amount: totalPrice, 
                            description: `Order #${orderNo} added on ${new Date().toLocaleDateString()}` 
                        }
                    } 
                },
                { new: true, upsert: true }
            );

            const newAudit = new Audit ({
                username: req.session.username,
                action: "Add",
                page: "Orders",
                oldData: "--",
                newData: "New order: " + orderNo 
            })
            await newAudit.save();

            console.log(`Main fund updated: ${mainFund.balance}`);
        } else {
            console.log('Order is unpaid, main fund remains unchanged.');
        }

        // Deduct inventory for each product in the order
        for (const item of items) {
            console.log(`Updating inventory for SKU: ${item.SKU}, Variation: ${item.variant}, Quantity: ${item.quantity}`);
            const product = await Product.findOneAndUpdate(
                { SKU: item.SKU, "variations.variation": item.variant },
                { $inc: { "variations.$.stocks": -item.quantity } },
                { new: true }
            );

            if (!product) {
                console.error(`Product with SKU: ${item.SKU} and Variation: ${item.variant} not found`);
            } else {
                console.log(`Updated product inventory: ${product}`);
            }
        }

        res.send({ success: true, message: 'Order added successfully, main fund updated with transaction if applicable.' });
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
        const processedData = await processCsvData(csvFilePath);
        console.log('Processed Data:', processedData);

        // Verify processedData is an array
        if (!Array.isArray(processedData)) {
            console.error('Error: Processed data is not an array');
            throw new Error('Processed data is not an array');
        }

        lastUpdatedDate = new Date().toLocaleString();

        console.log('Processed CSV Data:', processedData);

        // Assuming processCsvData returns an array of orders, save each order to the database
        for (let orderData of processedData) {
            // Check if the order number already exists
            const existingOrder = await OrderInfo.findOne({ orderNumber: orderData.orderNumber });
            if (existingOrder) {
                // If the order exists, check if payment status has changed from unpaid to paid
                if (existingOrder.paymentStatus.toLowerCase() === 'unpaid' && orderData.paymentStatus.toLowerCase() === 'paid') {
                    console.log(`Order Number ${orderData.orderNumber} payment status changed from unpaid to paid. Processing...`);

                    // Update the order details
                    existingOrder.totalOrderQuantity = orderData.totalOrderQuantity;
                    existingOrder.items = orderData.items;
                    existingOrder.paymentStatus = orderData.paymentStatus;
                    existingOrder.paymentMethod = orderData.paymentMethod;
                    existingOrder.shippingRate = orderData.shippingRate;
                    existingOrder.total = orderData.total;
                    existingOrder.fulfillmentStatus = orderData.fulfillmentStatus;
                    existingOrder.orderedFrom = orderData.orderedFrom;

                    // Save the updated order
                    await existingOrder.save();
                    console.log(`Order #${orderData.orderNumber} updated in the database.`);

                    // Update inventory based on the fulfillment status of the order
                    await updateInventoryBasedOnFulfillmentStatus(existingOrder._id, existingOrder.fulfillmentStatus);
                } else {
                    console.log(`Order Number ${orderData.orderNumber} has no relevant changes. Skipping...`);
                    continue; // Skip if payment status didn't change from unpaid to paid
                }
            } else {
                // If the order does not exist, create a new order
                const newOrder = new OrderInfo({
                    orderNumber: orderData.orderNumber,
                    dateCreated: orderData.dateCreated,
                    totalOrderQuantity: orderData.totalOrderQuantity,
                    items: orderData.items,
                    paymentStatus: orderData.paymentStatus,
                    paymentMethod: orderData.paymentMethod,
                    shippingRate: orderData.shippingRate,
                    total: orderData.total,
                    fulfillmentStatus: orderData.fulfillmentStatus,
                    orderedFrom: orderData.orderedFrom
                });

                try {
                    // Save the new order to the database
                    await newOrder.save();

                    const newAudit = new Audit ({
                        username: req.session.username,
                        action: "Add",
                        page: "Orders",
                        oldData: "--",
                        newData: "New order: " + newOrder.orderNumber
                    })
                    await newAudit.save();

                    console.log(`New order #${orderData.orderNumber} saved to the database.`);

                    // Update inventory based on the fulfillment status of the order
                    await updateInventoryBasedOnFulfillmentStatus(newOrder._id, newOrder.fulfillmentStatus);
                } catch (saveError) {
                    console.error(`Error saving order #${orderData.orderNumber}:`, saveError);
                    // Handle any save errors
                }
            }
        }

        res.status(200).json({ message: 'File uploaded, orders processed, and inventory updated successfully.' });
    } catch (error) {
        console.error('Error processing CSV file:', error);
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

const updateInventoryBasedOnFulfillmentStatus = async (orderId, fulfillmentStatus) => {
    try {
        // Fetch the order
        const order = await OrderInfo.findById(orderId).lean();
        if (!order) {
            console.error('Order not found');
            return;
        }

        console.log(`Order found: ${JSON.stringify(order, null, 2)}`);
        const orderDate = new Date(order.dateCreated);

        for (const item of order.items) {
            console.log(`Processing SKU: ${item.sku}, Variation: ${item.variant}, Quantity: ${item.quantity}`);

            // Fetch the product based on SKU
            const product = await Product.findOne({ SKU: item.sku }).lean();
            if (!product) {
                console.error(`Product with SKU: ${item.sku} not found`);
                continue;
            }

            console.log(`Product found: ${JSON.stringify(product, null, 2)}`);
            const lastInventoryUpdate = new Date(product.lastInventoryUpdate);

            if (orderDate <= lastInventoryUpdate) {
                console.log(`Order date ${orderDate} is before or on the last inventory update date ${lastInventoryUpdate}. Skipping inventory update.`);
                continue;
            }

            // Clean and preprocess text for variation comparison
            const cleanVariant = item.variant.toLowerCase().replace(/^(size:|variation:)/, '').trim();
            console.log(`Cleaned variant: ${cleanVariant}`);

            const variation = product.variations.find(v => v.variation.trim().toLowerCase() === cleanVariant);

            if (!variation) {
                console.error(`Variation ${item.variant} not found for SKU ${item.sku}`);
                continue;
            }

            let updateQuantity = 0;
            const normalizedFulfillmentStatus = fulfillmentStatus.toLowerCase();
            if (normalizedFulfillmentStatus === 'fulfilled') {
                updateQuantity = -item.quantity;
                console.log(`Decreasing inventory for SKU: ${item.sku}, Variation: ${item.variant} by ${item.quantity} through order ${orderId}`);
            } else if (normalizedFulfillmentStatus === 'cancelled') {
                updateQuantity = item.quantity;
                console.log(`Increasing inventory for SKU: ${item.sku}, Variation: ${item.variant} by ${item.quantity} through order ${orderId}`);
            } else if (normalizedFulfillmentStatus === 'unfulfilled') {
                console.log(`No change in inventory for SKU: ${item.sku}, Variation: ${item.variant} as fulfillment status is unfulfilled through order ${orderId}`);
                continue;
            }

            // Check if the update will result in negative stock
            if (variation.stocks + updateQuantity < 0) {
                console.error(`Cannot update inventory for SKU: ${item.sku}, Variation: ${item.variant}. Insufficient stock.`);
                continue;
            }

            // Update the variation stock
            variation.stocks += updateQuantity;
            const currentDateTime = new Date();

            // Prepare updates object
            const updates = {
                variations: product.variations,
                //lastInventoryUpdate: currentDateTime,
            };

            try {
                // Find the product by ID and update its details
                const updatedProduct = await Product.findByIdAndUpdate(product._id, updates, { new: true });

                if (!updatedProduct) {
                    console.error('No document matched or no modification was made.');
                } else {
                    console.log('Update successful:', JSON.stringify(updatedProduct, null, 2));
                }
            } catch (err) {
                console.error('Update failed:', err);
            }

            console.log({
                _id: product._id,
                'variations.variation': item.variant
            });

            console.log({
                'variations.$.stocks': variation.stocks,
                lastInventoryUpdate: currentDateTime
            });

            console.log(`Inventory updated for SKU: ${item.sku}, Variation: ${item.variant}, New Stocks: ${variation.stocks}`);
            console.log(`Product last updated date set to: ${currentDateTime}`);
        }

        console.log('Inventory update completed.');
    } catch (err) {
        console.error('Error updating inventory based on fulfillment status:', err);
    }
};

module.exports = { updateInventoryBasedOnFulfillmentStatus, getOrders, getAnOrder, uploadCSVFile, addOrder, uploadCSV, checkOrderNo };
