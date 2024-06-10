const OrderInfo = require('../models/OrderInfo');

const getOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;
        
        const totalOrders = await OrderInfo.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        const orders = await OrderInfo.find().skip(skip).limit(limit).lean();
        const initialOrders = page === 1 ? orders : [];
        const nextPage = page + 1;

        console.log(`Request page: ${page}`);
        console.log(`Total pages: ${totalPages}`);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            console.log('Sending JSON response');
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
                "grid-add-button": "Order",
                "grid-title": "ORDERS" 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getOrders };
