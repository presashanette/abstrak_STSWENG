const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const {getOrdersUnfulfilled, getOrdersFulfilled, getOrdersCancelled, getStocks, addReminder, getReminders, deleteReminder, getSalesMetric} = require('../controllers/dashboardController');
const {  handleCollectionPageRequest, handleAddCollectionRequest, handleCollectionProductsRequest, checkCollectionName, handleAllProductsRequest } = require('../controllers/collectionControllers');
const { fetchProductData, fetchProductMetrics, fetchProductGraphs, deleteProductById, checkName, checkSKU, fetchSizeStockCost, updateProduct, addProduct, getVariation, checkStock } = require('../controllers/productController');
const { uploadCSV, getOrders, getAnOrder, uploadCSVFile, addOrder, checkOrderNo } = require('../controllers/ordersController');
const { fetchExpenseGraphs, getTotalExpenses, getPaginatedExpenses, getAllCollections, getAllExpenses, getExpense, addExpense, updateExpense, deleteExpense } = require('../controllers/expensesController');
const { getVouchers } = require('../controllers/vouchersController');
const { login, logout } = require('../controllers/loginController');
const { signup } = require('../controllers/signupController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { viewDashboard, updateProfile, getProfile, checkIfAdmin, getNonAdminDetails, updateNonAdminDetails, checkExistingEmail, checkExistingUsername, createUser } = require('../controllers/userController');
// Import the suppliers controller
const {
  getPaginatedSuppliers,
  getSupplier,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getAllSuppliers
} = require('../controllers/suppliersController');

// Suppliers Routes
// Get all suppliers for dropdowns or quick listings
router.get('/suppliers', getAllSuppliers);

// Get paginated suppliers (with optional filters)
router.get('/api/suppliers', getPaginatedSuppliers);

// Get a specific supplier by ID
router.get('/api/suppliers/:id', getSupplier);

// Add a new supplier
router.post('/api/suppliers', addSupplier);

// Update an existing supplier
router.put('/api/suppliers/:id', updateSupplier);

// Delete a supplier
router.delete('/api/suppliers/:id', deleteSupplier);

const { getMainFundBalance } = require('../controllers/mainFundController');
const { viewAuditLog, getPaginatedAudits } = require('../controllers/auditLogControllers');

router.get('/api/mainfund/balance', getMainFundBalance);

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

const storageProfilePicture = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/uploads/users/');
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const uploadProfilePicture = multer({ storage: storageProfilePicture });
const uploadCollectionPicture = multer({ storage: storageCollectionPicture });
const uploadProductPicture = multer({ storage: storageProductPicture });


// Apply isAuthenticated middleware to all routes except login and logout (and signup)
router.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/logout' || req.path === '/signup') {
      return next();
  }
  return isAuthenticated(req, res, next);
});



// Route to update user profile
router.get('/api/users/profile', getProfile);
router.put('/api/users/update-profile', uploadProfilePicture.single('profilePicture'), updateProfile);


//user login
router.get('/login', (req, res) => {
  
  if(!req.session.userId){
    res.render('login');
  } else {
    res.redirect('/');
  }
});
router.post('/login', login);
router.get('/logout', logout);

router.get('/signup', (req, res) => {
  if (!req.session.userId) {
    res.render('signup');
  } else {
    res.redirect('/');
  }
});
router.post('/signup', signup);


router.get('/', (req, res) => {
    res.render('dashboard'); // main page
});

// dashboard
router.get('/api/ordersUnfulfilled', getOrdersUnfulfilled);
router.get('/api/ordersFulfilled', getOrdersFulfilled);
router.get('/api/ordersCancelled', getOrdersCancelled);
router.get('/api/getSales', getSalesMetric);
router.post('/api/addReminder', addReminder);
router.delete('/api/deleteReminder/:alertId', deleteReminder);
router.get('/api/getReminders', getReminders);
router.get('/api/stocks', getStocks);

// collections page
router.get('/collections', handleCollectionPageRequest);
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
router.post('/products/checkStock', checkStock);

router.get('/mainfund', async (req, res) => {
  const mainFund = await MainFund.findOne({});
  res.json({ balance: mainFund ? mainFund.balance : 0 });
});

// orders
router.get('/orders', getOrders);
router.get('/api/orders/:id', getAnOrder);
router.post('/orders/add', addOrder);
router.post('/upload-csv', uploadCSV.single('csvFile'), uploadCSVFile);
router.get('/orders/checkOrderNo', checkOrderNo);

//users
router.get('/users', viewDashboard);
router.get('/getUserDetails', getNonAdminDetails);
router.get('/checkIfAdmin', checkIfAdmin);
router.post('/updateUserDetails', updateNonAdminDetails);
router.post('/api/users/checkEmail', checkExistingEmail);
router.post('/api/users/checkUsername', checkExistingUsername);
router.post('/api/users/add', uploadProfilePicture.single('profilePicture'), createUser)

// expenses
router.get('/expenses', getAllExpenses);
router.get('/api/expenses', getPaginatedExpenses);
router.get('/api/expense-graphs', fetchExpenseGraphs);
router.get('/api/collections', getAllCollections);
router.get('/api/expenses/total', getTotalExpenses); // Add this new route
router.get('/api/expenses/:id',getExpense);
router.post('/api/expenses', addExpense);
router.put('/api/expenses/:id', updateExpense);
router.delete('/api/expenses/:id', deleteExpense);


// audit log
router.get('/auditLog', getPaginatedAudits);

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
