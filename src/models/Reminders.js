const { Schema, model } = require('mongoose');
const mongoose = require('mongoose');

const reminderSchema = new Schema({
    _id: { type: String, required: true, unique: true, default: () => new mongoose.Types.ObjectId() }, 
    dateCreated: { type: Date, default: Date.now },
    description: { type: String, required: true},
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Reminder = model('Reminder', reminderSchema); 

module.exports = Reminder;
