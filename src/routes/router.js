const express = require('express');
const path = require('path');

const router = express.Router();
const multer = require('multer');

const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');


const storageCollectionPicture = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/collections/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });


 

const uploadRestaurantPicture = multer({ storage: storageCollectionPicture });


// router.get('/', (req, res) => {
//     // res.render("collections");
// });


router.get(['/', '/collections'], async (req, res) => {
    try {
        const collections = await Collection.find({}).lean();
        console.log(collections)
        res.render("collections", { collections, "grid-add-button": "Collection", "grid-title": "COLLECTIONS" });
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});


router.get('/addcollection', (req, res) => {  
    res.render("addcollection");
});


router.get('/collections/:id', async (req, res) => {
    try {
        // console.log(req.params.id)
        const products  = await Collection.findById(req.params.id).populate('pieces').lean();
        
        res.render("products", { products: products.pieces, "grid-add-button": "Product", "grid-title": products.name});
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/api/collections/add', uploadRestaurantPicture.single('collectionPicture'),(req, res) => {
    try {
        const { name, description } = req.body
        const collectionPicture = req.file || { filename: 'default.jpg' }

        const newCollection = new Collection({
            name,
            description,
            collectionPicture: collectionPicture.filename
        })

        newCollection.save();
    } catch (error) {
        console.log("error in add collections: " + error)
    }
})


module.exports = router;