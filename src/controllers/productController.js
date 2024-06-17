const Product = require('../models/Product');
const AbstrakCol = require('../models/AbstrakCol');
const OrderInfo = require('../models/OrderInfo');
const { addProductToCollection } = require('./collectionControllers');

async function fetchProductData(req, res) {
    try {
        const productId = req.params.id;

        // Fetch product data
        const product = await Product.findById(productId).lean();
        if (!product) {
            console.log("Product not found");
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log("Fetched Product:", JSON.stringify(product, null, 2));

        // Clean product name
        const cleanedProductName = product.name.replace(/"/g, '').toLowerCase();
        console.log("Cleaned Product Name:", cleanedProductName);

        // Aggregate orders that include the product name
        const orderAggregations = await OrderInfo.aggregate([
            { $unwind: '$items' },
            { $project: {
                cleanedItemName: { $toLower: { $replaceAll: { input: '$items.itemName', find: '"', replacement: '' } } },
                itemName: '$items.itemName',
                variant: '$items.variant',
                quantity: '$items.quantity',
                quantityRefunded: '$items.quantityRefunded'
            }},
            { $match: { cleanedItemName: cleanedProductName }},
            { $group: {
                _id: '$variant',
                totalSold: { $sum: '$quantity' },
                totalRefunded: { $sum: '$quantityRefunded' },
                netSold: { $sum: { $subtract: ['$quantity', '$quantityRefunded'] }}
            }},
            { $project: {
                _id: 0,
                variant: '$_id',
                totalSold: 1,
                totalRefunded: 1,
                netSold: 1
            }}
        ]);

        // Debugging: Log aggregated order data
        console.log("Order Aggregations:", JSON.stringify(orderAggregations, null, 2));

        // Create a map to store the sold number per variation
        const soldPerVariation = {};

        // Map the aggregated results to the product variations
        const variationMap = orderAggregations.reduce((map, agg) => {
            // Remove "Size:" prefix if present
            const variantKey = agg.variant.toLowerCase().replace(/^size:/, '').trim();
            map[variantKey] = agg;
            return map;
        }, {});

        // Debugging: Log variation map
        console.log("Variation Map:", JSON.stringify(variationMap, null, 2));

        // Add totalSold, totalRefunded, and netSold to each variation in the product
        product.variations.forEach(variation => {
            const variationKey = variation.variation.trim().toLowerCase();
            const agg = variationMap[variationKey] || { totalSold: 0, totalRefunded: 0, netSold: 0 };
            variation.totalSold = agg.totalSold;
            variation.totalRefunded = agg.totalRefunded;
            variation.netSold = agg.netSold;

            // Store the sold number in the soldPerVariation map
            soldPerVariation[variation.variation] = agg.totalSold;

            // Debugging: Log each variation's sold data
            console.log(`Variation: ${variation.variation}, Total Sold: ${variation.totalSold}`);
        });

        // Debugging: Log the soldPerVariation map
        console.log("Sold Per Variation:", JSON.stringify(soldPerVariation, null, 2));

        res.json(product);
    } catch (error) {
        console.error('Error fetching product data:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function getVariation(req, res) {
    try {
        const sku = req.query.sku;
        if (!sku) {
            return res.status(400).json({ message: 'SKU is required' });
        }

        const product = await Product.findOne({ SKU: sku }); // Correct Mongoose query
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// async function getVariation(req, res) {
//     try {
//         const { sku } = req.query;

//         if (!sku) {
//             return res.status(400).json({ error: 'SKU is required' });
//         }

//         // Find product by SKU
//         const product = await Product.findOne({ SKU: sku }).lean();

//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         res.json(product.variations);
//     } catch (error) {
//         console.error('Error fetching product variations:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

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
    const {name, id }= req.body;

    Product.findOne({ name: name }).lean().then(product => {
        console.log(product);

    if(product && product._id != id) {
        res.send({ success: false, message: 'Product name is not available' })
      } else {
        res.send({ success: true, message: 'Product name is available' })
      }
  
     
    }).catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
    });   

}

async function addProduct(req, res) {
    const { name, price, SKU, material, variations, collectionId } = req.body;

    const newProduct = new Product({
        name,
        picture: req.file.filename ,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations)
    });


    try{
        await newProduct.save();
        addProductToCollection(collectionId, newProduct._id);
        res.send({ success: true, message: 'Product added successfully' });
        
    } catch (err) {
        console.log("error in add product: " + err)
    }
    
}

async function fetchSizeStockCost(req, res) {
  const productId = req.params.id;
  console.log("Fetched Product:");
  console.log(productId);
  try {
      const product = await Product.findById(productId).lean();
      console.log(product);
      
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);  // Send the product data as a JSON response
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching product data" });
  }
}

async function updateProduct(req, res) {
  const productId = req.params.id;

  const { name, price, SKU, material, variations } = req.body;

  const updates = {
        name,
        price,
        SKU,
        material: JSON.parse(material),
        variations: JSON.parse(variations),
    };

    if(req.file) {
        updates.picture = req.file.filename;
    }

  try {
      // Find the product by ID and update its details
      const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

      if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
      }

      res.json(updatedProduct); // Return the updated product
  } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
  }
}

async function checkSKU(req, res) {
    const sku = req.body.sku;

    Product
      .findOne({ SKU: sku })
      .lean()
      .then(product => {
        
        if(product && product._id != req.body.id) {
          res.send({ success: false, message: 'SKU is not available' })
        } else {
          res.send({ success: true, message: 'SKU is available' })
        }
      })
      .catch(err => {
        res.status(500).json({ error: 'Internal Server Error' });
      });   


}

module.exports = {
    fetchProductData,
    deleteProductById,
    checkName,
    checkSKU,
    fetchSizeStockCost,
    updateProduct,
    addProduct,
    getVariation
};