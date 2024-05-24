const express = require('express');
const path = require('path');

const router = express.Router();
const multer = require('multer');

const Collection = require('../models/AbstrakCol');


const storageCollectionPicture = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/collections/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });


const uploadRestaurantPicture = multer({ storage: storageCollectionPicture });


router.get('/', (req, res) => {
    res.render("collections");
});


router.get('/collections', (req, res) => {
    Collection.find({}, (err, collections) => {
        res.render("collections", {collections});
    })
    res.render("collections");
})

router.get('/addcollection', (req, res) => {  
    res.render("addcollection");
});

router.post('/api/collections/add', uploadRestaurantPicture.single('collectionPicture'),(req, res) => {
    try {
        const { name, description } = req.body
        const collectionPicture = req.file

        const newCollection = new Collection({
            name,
            description,
            collectionPicture: collectionPicture.filename
        })

        newCollection.save();


        console.log(name, description, collectionPicture.filename)
    } catch (error) {
        console.log("error in add collections: " + error)
    }
})

module.exports = router;