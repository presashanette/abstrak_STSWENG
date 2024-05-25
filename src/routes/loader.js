const Collection = require('../models/AbstrakCol');
const Product = require('../models/Product');

async function load() {
    try {
        // Delete all documents in Collection and Product collections
        await Promise.all([Collection.deleteMany({}), Product.deleteMany({})]);
        
        // Create a new Collection document
        const coll = await new Collection({
            name: 'Made Human',
            pieces: [],
            collectionPicture: 'madehuman.jpg'
        }).save();

        // Create a new Product document
        const prod = await new Product({
            name: 'Memories',
            status: 'Available',
            pictures: ['memories1.png'],
            price: 100,
            SKU: 'MEM001',
            material: ['Cotton', 'Polyester'],
            variations: {
                'A': 20,
                'B': 30,
                'C': 10,
                'D': 40,
                'E': 50,
                'F': 60
            }
        }).save();

        // Push the _id of the newly created Product document into the pieces array of the Collection
        coll.pieces.push(prod._id);

        // Save the updated Collection document
        await coll.save();

        console.log('Data loaded successfully.');
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = load;