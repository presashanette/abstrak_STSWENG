const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const { handleCollectionPageRequest, handleAddCollectionRequest, handleCollectionProductsRequest, checkCollectionName, handleAllProductsRequest } = require('../controllers/collectionControllers');
const { fetchProductData, fetchProductMetrics, fetchProductGraphs, deleteProductById, checkName, checkSKU, fetchSizeStockCost, updateProduct, addProduct, getVariation } = require('../controllers/productController');
const { uploadCSV, getOrders, getAnOrder, uploadCSVFile, addOrder, checkOrderNo } = require('../controllers/ordersController');
const { getAllExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expensesController');
const { getVouchers } = require('../controllers/vouchersController');
const { login, logout } = require('../controllers/loginController');
const { isAuthenticated } = require('../middleware/authMiddleware');





const storageCollectionPicture = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/collections/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});


const storageProductPicture = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/products/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});


const uploadCollectionPicture = multer({ storage: storageCollectionPicture });
const uploadProductPicture = multer({ storage: storageProductPicture });



//user login
router.get('/login', (req, res) => { res.render('login');});
router.post('/login', login);
router.get('/logout', logout);

//middelware
router.use(isAuthenticated);

// collections page
router.get(['/', '/collections'], handleCollectionPageRequest);
router.get('/collections/:id', handleCollectionProductsRequest);
router.post('/api/collections/add', uploadCollectionPicture.single('collectionPicture'), handleAddCollectionRequest)
router.delete('/api/products/delete/:id', deleteProductById);
router.post('/api/collections/checkName', checkCollectionName);
router.post('/api/products/checkName', checkName);
router.get('/api/getAbstrakInvento', handleAllProductsRequest);

// products
router.post('/api/products/check-name', checkName);
router.post('/api/products/check-sku', checkSKU);
router.get('/api/product', getVariation);
router.get('/products/:id', fetchProductData);
router.get('/products/:id', fetchSizeStockCost);
router.get('/products/metrics/:id', fetchProductMetrics);
router.get('/products/info/:id', fetchProductMetrics);
router.get('/product-graphs/:id', fetchProductGraphs);
router.post('/api/products/update/:id', uploadProductPicture.single('picture'), updateProduct);
router.post('/api/products/add', uploadProductPicture.single('picture'), addProduct);


// orders
router.get('/orders', getOrders);
router.get('/api/orders/:id', getAnOrder);
router.post('/orders/add', addOrder);
router.post('/upload-csv', uploadCSV.single('csvFile'), uploadCSVFile);
router.get('/orders/checkOrderNo', checkOrderNo);

// expenses
router.get('/expenses', getAllExpenses);
router.post('/api/expenses', addExpense);
router.put('/api/expenses/:id', updateExpense);
router.delete('/api/expenses/:id', deleteExpense);

// vouchers
router.get('/api/search-voucher', getVouchers);

// testing
router.get('/api/products/name/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const product = await Product.findOne({ name: name });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;