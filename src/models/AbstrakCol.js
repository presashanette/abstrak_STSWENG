const { Schema, model } = require('mongoose');

const abstrakColSchema = new Schema ({
    name: {type: String, required: true},
    pieces: {type: [Schema.Types.ObjectId], required: true},
    
})

const AbstrakCol = model('abstrakCol', abstrakColSchema)

module.exports = AbstrakCol;