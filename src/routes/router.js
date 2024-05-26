const express = require('express');
const path = require('path');

const router = express.Router();
const multer = require('multer');

const { handleCollectionPageRequest, handleAddCollectionRequest, handleCollectionProductsRequest } = require('../controllers/collectionControllers');
const { deleteProductById } = require('../controllers/productController');



const storageCollectionPicture = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/collections/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});


const uploadRestaurantPicture = multer({ storage: storageCollectionPicture });


// collections page
router.get(['/', '/collections'], handleCollectionPageRequest);
router.get('/addcollection', (req, res) => { res.render("addcollection");});
router.get('/collections/:id', handleCollectionProductsRequest);
router.post('/api/collections/add', uploadRestaurantPicture.single('collectionPicture'), handleCollectionPageRequest)
// product 
router.delete('/api/products/delete/:id', deleteProductById);
router.get('/collections', require('../controllers/productController').getCollections);



module.exports = router;