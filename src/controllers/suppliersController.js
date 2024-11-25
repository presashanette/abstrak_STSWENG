const Supplier = require('../models/Supplier');

// Get Paginated Suppliers with Filters and Sorting
const getPaginatedSuppliers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const searchKeyword = req.query.keyword ? req.query.keyword.toLowerCase() : null;
        const filterType = req.query.filter || null; // Category filter
        const subCategoryFilter = req.query.subCategory || null; // Subcategory filter
        const sortType = req.query.sort || null; // Sorting option

        const filters = {};

        // Search by keyword
        if (searchKeyword) {
            filters.$or = [
                { name: { $regex: searchKeyword, $options: 'i' } },
                { contactInfo: { $regex: searchKeyword, $options: 'i' } },
                { address: { $regex: searchKeyword, $options: 'i' } },
                { notes: { $regex: searchKeyword, $options: 'i' } },
                { 'productsSupplied.productName': { $regex: searchKeyword, $options: 'i' } },
                { 'productsSupplied.category': { $regex: searchKeyword, $options: 'i' } },
            ];
        }

        // Filter by category
        if (filterType) {
            filters['productsSupplied.category'] = filterType;
        }

        // Filter by subcategory
        if (subCategoryFilter) {
            filters['productsSupplied.subCategory'] = { $regex: subCategoryFilter, $options: 'i' };
        }

        // Default sorting by name (ascending)
        let sort = { name: 1 };

        // Apply sorting
        if (sortType) {
            const [field, order] = sortType.split(':');
            sort = { [field]: order === 'desc' ? -1 : 1 };
        }

        // Fetch suppliers with filters and pagination
        const totalSuppliers = await Supplier.countDocuments(filters);
        const totalPages = Math.ceil(totalSuppliers / limit);

        const suppliers = await Supplier.find(filters)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            suppliers,
            currentPage: page,
            totalPages,
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get a Single Supplier by ID
const getSupplier = async (req, res) => {
    const supplierId = req.params.id;
    try {
        const supplier = await Supplier.findById(supplierId).lean();
        if (!supplier) {
            return res.status(404).send('Supplier not found');
        }
        res.send(supplier);
    } catch (err) {
        console.error(`Error fetching supplier with ID: ${supplierId}`, err);
        res.status(500).send('Server Error');
    }
};

// Add Supplier
async function addSupplier(req, res) {
    try {
        const { name, contactInfo, address, productsSupplied, notes } = req.body;

        const newSupplier = new Supplier({
            name,
            contactInfo,
            address,
            productsSupplied, // This should be an array of product objects
            notes,
        });

        await newSupplier.save();
        res.status(201).json({ success: true, message: 'Supplier added successfully.' });
    } catch (error) {
        console.error('Error adding supplier:', error);
        res.status(500).json({ success: false, message: 'Error adding supplier.' });
    }
}


// Update Supplier
async function updateSupplier(req, res) {
    try {
        const supplierId = req.params.id;
        const { productsSupplied } = req.body;

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            supplierId,
            { $push: { productsSupplied: { $each: productsSupplied } } },
            { new: true }
        );

        if (!updatedSupplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found.' });
        }

        res.status(200).json({ success: true, message: 'Products added to supplier.', supplier: updatedSupplier });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ success: false, message: 'Error updating supplier.' });
    }
}



// Delete a Supplier
const deleteSupplier = async (req, res) => {
    const supplierId = req.params.id;
    try {
        const supplier = await Supplier.findByIdAndDelete(supplierId);
        if (!supplier) {
            return res.status(404).send('Supplier not found');
        }
        res.send(supplier);
    } catch (err) {
        console.error(`Error deleting supplier with ID: ${supplierId}`, err);
        res.status(500).send('Server Error');
    }
};

// Get All Suppliers for Dropdowns or Listings
const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).lean(); // Fetch all suppliers
        res.render('suppliers', { suppliers });
    } catch (err) {
        console.error('Error fetching suppliers:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getPaginatedSuppliers,
    getSupplier,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getAllSuppliers,
};
