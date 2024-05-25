const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');
const fs = require('fs')


const collectionsJson = "src/models/data/data-abstrakcols.json";
const productsJson = "src/models/data/data-products.json";



function parseJson(pathToJson){
    return JSON.parse(fs.readFileSync(pathToJson))
}


async function loadCollections() {
    result = parseJson(collectionsJson)
    await Collection.deleteMany({}).then(() => {
        Collection.insertMany(result)
    });
}


async function loadProducts() {
    result = parseJson(productsJson)
    await Product.deleteMany({}).then(() => {
        Product.insertMany(result)
    });
}


module.exports = { loadCollections, loadProducts  };