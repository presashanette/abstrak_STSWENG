const Audit = require('../models/Audit');

async function viewAuditLog(req, res) {
    try {
        const changes = await Audit.find({}).limit(10).lean();
        console.log(changes);
        res.render('auditLog', { changes });
    } catch (err) {
        console.log(err);
        res.status.send("Internal Server Error");
    }
}

// HANDLE PAGINATION
const getPaginatedAudits = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const filter = {};
        const sortOrder = { dateTime: -1 };

        console.log('Filter object:', JSON.stringify(filter));
        console.log('Sort order:', JSON.stringify(sortOrder));

        const totalAudit = await Audit.countDocuments(filter);
        console.log(`Total audit count: ${totalAudit}`);
        
        const totalPages = Math.ceil(totalAudit / limit);
        console.log(`Total pages: ${totalPages}`);

        const changes = await Audit.find(filter)
            .sort(sortOrder) // Sort by dateTime in descending order
            .skip(skip) // Skip the specified number of documents
            .limit(limit) // Limit the number of documents returned
            .lean();
        console.log('Retrieved audits:', JSON.stringify(changes, null, 2));

        const nextPage = page < totalPages ? page + 1 : null;
        console.log(`Current page: ${page}, Next page: ${nextPage}`);

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({
                changes,
                currentPage: page,
                totalPages, // Ensure totalPages is included in the response
            });
            console.log("hello");
        } else {
            res.render('auditLog', {
                changes: JSON.stringify(changes),
                currentPage: page,
                totalPages,
                nextPage,
                "grid-add-button": "Audit log",
                "grid-title": "AUDIT LOG"
            });
        }
    } catch (err) {
        console.error('Error fetching paginated audits:', err);
        res.status(500).send('Server Error');
    }
};

// HANDLE FILTER AND SORT
const buildAuditFilter = async (query) => {
    const { username, page, date } = query;

    let filter = {}; // Use 'let' to allow modifications
    if (username) {
        filter.username = username;
        console.log(`Filter by username: ${username}`);
    }
    if (page) {
        filter.page = page;
        console.log(`Filter by pages: ${page}`);
    }

    filter.date = {};
    if (date) {
        filter.date.$gte = new Date(date).setHours(0, 0, 0, 0); // Start of the day
        console.log(`Filter by date: ${new Date(date).toISOString()}`);
    }

    console.log('Final filter object:', filter);
    return filter;
};

const buildSortOrder = (sort) => {
    let sortOrder = {};
    if (sort) {
        if (sort === 'amountasc') {
            sortOrder.amount = 1;
            console.log('Sorting by amount ascending');
        } else if (sort === 'amountdesc') {
            sortOrder.amount = -1;
            console.log('Sorting by amount descending');
        } else if (sort === 'dateasc') {
            sortOrder.date = 1;
            console.log('Sorting by date ascending');
        } else if (sort === 'datedesc') {
            sortOrder.date = -1;
            console.log('Sorting by date descending');
        }
    } else {
        sortOrder.date = -1; // Default sort by date in descending order
        console.log('Default sorting by date descending');
    }

    return sortOrder;
};


module.exports = {
    getPaginatedAudits
}