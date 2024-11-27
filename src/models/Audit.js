const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const auditSchema = new Schema({
    _id: { type: String, required: true, unique: true }, 
    username: { type: String, unique: false, required: true },
    dateTime: { type: Date, default: Date.now },
    action: { type: String, required: true},
    page: { type: String, required: true},
    oldData: { type: String, required: false },
    newData: { type: String, required: false },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Audit = model('Audit', auditSchema); 

module.exports = Audit;
