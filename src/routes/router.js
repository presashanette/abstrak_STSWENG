const express = require('express');
const path = require('path');

const router = express.Router();
const multer = require('multer');

const { handleCollectionPageRequest, handleAddCollectionRequest, handleCollectionProductsRequest } = require('../controllers/collectionControllers');


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


module.exports = router;