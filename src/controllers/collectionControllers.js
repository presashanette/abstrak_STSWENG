const Collection = require('../models/AbstrakCol');
const Audit = require('../models/Audit');
const Product = require('../models/Product');
const mongoose = require('mongoose');

async function handleCollectionPageRequest (req, res) {
    try {
        const collections = await Collection.find({}).lean();
        res.render("collections", { collections, "grid-add-button": "Collection", "grid-title": "COLLECTIONS" });
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

async function addProductToCollection(collectionId, productId) {
    console.log("Received collectionId:", collectionId); // Log collectionId
    console.log("Received productId:", productId); // Log productId

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
        throw new Error('Invalid collectionId');
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid productId');
    }

    const collection = await Collection.findById(collectionId);
    if (!collection) {
        throw new Error('Collection not found');
    }

    if (!collection.pieces.includes(productId)) {
        collection.pieces.push(productId);
        await collection.save();
    }
}


async function handleAddCollectionRequest (req, res) {
    try {
        const { name, description } = req.body
        const collectionPicture = req.file || { filename: 'default.jpg' }
        const newCollection = new Collection({
            name,
            description,
            pieces: [],
            collectionPicture: collectionPicture.filename
        })

        //record changes
        const newAudit = new Audit ({
            username: req.session.username,
            action: "Add",
            page: "Collections",
            oldData: "--",
            newData: "New collection: " + name
        })

        await newAudit.save();
        await newCollection.save();
        res.send({ success: true, message: 'Collection added successfully' })
    } catch (error) {
        console.log("error in add collections: " + error)
    }
}

async function checkCollectionName (req, res) {
    const name = req.body.name;

    Collection.findOne({ name: name }).lean().then(collection => {
        if(collection) {
            res.send({ success: false, message: 'Collection name is not available' })
        } else {
            res.send({ success: true, message: 'Collection name is available' })
        }
    }
    ).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });
}


async function handleCollectionProductsRequest (req, res) {
    try {
        const collection  = await Collection.findById(req.params.id).populate('pieces').lean();
        const products = collection.pieces;
        
        products.forEach(product => {
            product.totalStock = product.variations.reduce((a, b) => a + b.stocks, 0);
            
        })
        
        res.render("products", { products: collection.pieces, "grid-add-button": "Product", "grid-title": collection.name, "collectionId": collection._id});
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}   

async function handleAllProductsRequest(req, res) {
    try {
       
        const collections = await Collection.find().populate('pieces').lean();

        let allProducts = [];
        
        collections.forEach(collection => {
            if (collection.pieces && Array.isArray(collection.pieces)) {
               
                let products = collection.pieces.filter(product => {
                    product.totalStock = product.variations.reduce((a, b) => a + b.stocks, 0);
                    return product.totalStock > 0;
                });
                
                allProducts = allProducts.concat(products);
            }
        });

        console.log(allProducts);

        res.json(allProducts);
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {  handleCollectionPageRequest,
                    handleAddCollectionRequest,
                    handleCollectionProductsRequest,
                    checkCollectionName,
                    addProductToCollection,
                    handleAllProductsRequest
                };