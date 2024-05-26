


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

async function checkName(req, res) {
    const name = req.body.name;

    Product.findOne({ name: name }).lean().then(product => {
    if(product) {
        res.send({ success: false, message: 'Product name is not available' })
      } else {
        res.send({ success: true, message: 'Product name is available' })
      }
  
     
    }).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });   

}


async function checkSKU(req, res) {
    const sku = req.body.sku;

    Product
      .findOne({ SKU: sku })
      .lean()
      .then(product => {
        if(product) {
          res.send({ success: false, message: 'SKU is not available' })
        } else {
          res.send({ success: true, message: 'SKU is available' })
        }
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
      });   



}
module.exports = { deleteProductById, checkName, checkSKU };
