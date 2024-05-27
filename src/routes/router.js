const express = require('express');
const router = express.Router();
const multer = require('multer');

const { handleCollectionPageRequest, handleAddCollectionRequest, handleCollectionProductsRequest, checkCollectionName } = require('../controllers/collectionControllers');
const { deleteProductById, checkName, checkSKU, fetchSizeStockCost, updateProduct, addProduct } = require('../controllers/productController');



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


const uploadRestaurantPicture = multer({ storage: storageCollectionPicture });
const uploadProductPicture = multer({ storage: storageProductPicture });

// collections page
router.get(['/', '/collections'], handleCollectionPageRequest);
router.get('/collections/:id', handleCollectionProductsRequest);
router.post('/api/collections/add', uploadRestaurantPicture.single('collectionPicture'), handleAddCollectionRequest)
router.delete('/api/products/delete/:id', deleteProductById);
router.post('/api/collections/checkName', checkCollectionName);
router.post('/api/products/checkName', checkName);

// products
router.post('/api/products/check-name', checkName);
router.post('/api/products/check-sku', checkSKU);
router.get('/products/:id', fetchSizeStockCost);
router.put('/api/products/update/:id', updateProduct);
router.post('/api/products/add', uploadProductPicture.single('picture'), addProduct);
module.exports = router;