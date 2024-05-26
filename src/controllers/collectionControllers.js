const Collection = require('../models/AbstrakCol');


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

async function handleAddCollectionRequest (req, res) {
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
}


async function handleCollectionProductsRequest (req, res) {
    try {
        const collection  = await Collection.findById(req.params.id).populate('pieces').lean();
        const products = collection.pieces;
        
        products.forEach(product => {
            product.totalStock = product.variations.reduce((a, b) => a + b.stocks, 0);
            
        })
        
        res.render("products", { products: collection.pieces, "grid-add-button": "Product", "grid-title": collection.name});
    } catch (err) {
        // Handle error
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}   
module.exports = {  handleCollectionPageRequest,
                    handleAddCollectionRequest,
                    handleCollectionProductsRequest
                
                };