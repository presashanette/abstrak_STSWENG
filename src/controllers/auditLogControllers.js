const mongoose = require('mongoose');
const Audit = require('../models/Audit');

async function viewAuditLog(req, res) {
    try {
        res.render('auditLog');
    } catch (err) {
        console.log(err);
        res.status.send("Internal Server Error");
    }
}

module.exports = {
    viewAuditLog
}