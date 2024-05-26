const express = require('express');
const path = require('path');
const Product = require('../models/Product');
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
router.get('/collections/:id', handleCollectionProductsRequest);
router.post('/api/collections/add', uploadRestaurantPicture.single('collectionPicture'), handleAddCollectionRequest)
router.delete('/api/products/delete/:id', deleteProductById);

router.post('/api/products/check-name', (req, res) => {
  const name = req.body.name;

  Product.findOne({ name: name }).lean().then(product => {
    
    console.log(product)
    if(product) {
      res.send({ success: false, message: 'Product name is not available' })
    } else {
      res.send({ success: true, message: 'Product name is available' })
    }

   
  }).catch(err => {
      res.status(500).json({ error: 'Internal Server Error' });
  });
});


router.post('/api/products/check-sku', (req, res) => {
  const sku = req.body.sku;

  Product
    .findOne({ SKU: sku })
    .lean()
    .then(product => {
      console.log(product)
      if(product) {
        res.send({ success: false, message: 'SKU is not available' })
      } else {
        res.send({ success: true, message: 'SKU is available' })
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Internal Server Error' });
    });

})

module.exports = router;