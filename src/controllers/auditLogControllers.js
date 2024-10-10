const mongoose = require('mongoose');
const Audit = require('../models/Audit');

async function viewAuditLog(req, res) {
    try {
        const changes = await Audit.find({}).lean();
        console.log(changes);
        res.render('auditLog', { changes });
    } catch (err) {
        console.log(err);
        res.status.send("Internal Server Error");
    }
}

// HANDLE PAGINATION


// HANDLE FILTER AND SORT



module.exports = {
    viewAuditLog
}