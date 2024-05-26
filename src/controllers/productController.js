// const { Product, AbstrakCol } = require('./models');

// router.get('/collections', async (req, res) => {
//     try {
//         const collections = await AbstrakCol.find().populate('pieces').exec();
//         res.render('collections', { collections });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//     }
// });


const Product = require('../models/Product');
const AbstrakCol = require('../models/AbstrakCol');

async function deleteProductById(req, res) {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const associatedCollections = await AbstrakCol.find({ pieces: productId });

        if (associatedCollections.length > 0) {
            if (req.query.deleteAssociations === 'true') {
                await AbstrakCol.updateMany({ pieces: productId }, { $pull: { pieces: productId } });
                await Product.findByIdAndDelete(productId);
                return res.send('Product and associations deleted');
            } else if (req.query.deleteAssociations === 'false') {
                await Product.findByIdAndDelete(productId);
                return res.send('Product deleted, associations retained');
            } else {
                return res.status(400).send('Invalid deleteAssociations query parameter');
            }
        } else {
            await Product.findByIdAndDelete(productId);
            return res.send('Product deleted');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).send('Server error');
    }
}

async function getCollections(req, res) {
    try {
        const collections = await AbstrakCol.find().populate('pieces').exec();
        res.render('collections', { collections });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports = { deleteProductById, getCollections };
