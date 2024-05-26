const { Schema, model } = require('mongoose');

const productSchema = new Schema ({
    name: {type: String, required: true},
    status: {type: String, required: true},
    pictures: {type: [String], required: true},
    price: {type: Number, required: true},
    SKU: {type: String, required: true},
    material: {type: [String], required: true},
    variations: {type: [Map], required: true},
})

const Product = model('product', productSchema)

module.exports = Product;