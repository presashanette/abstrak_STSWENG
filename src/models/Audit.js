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

// Virtual property to format dateTime
auditSchema.virtual('formattedDateTime').get(function () {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric'
    };
    return this.dateTime.toLocaleString('en-US', options);
});

// To ensure virtuals are included when converting to JSON
auditSchema.set('toJSON', { virtuals: true });
auditSchema.set('toObject', { virtuals: true });

const Audit = model('Audit', auditSchema); 

module.exports = Audit;
