const { Schema, model } = require('mongoose');

const auditSchema = new Schema({
    username: { type: String, unique: true, required: true },
    dateTime: { type: Date, default: Date.now },
    action: { type: String, required: true},
    page: { type: String, required: true},
    oldData: { type: String, required: false },
    newData: { type: String, required: true },
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});


const Audit = model('Audit', auditSchema); 

module.exports = Audit;
