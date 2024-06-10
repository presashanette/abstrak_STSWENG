const mongoose = require('mongoose');
const { Schema } = mongoose;

const SalesSchema = new Schema({
  orderNo: { type: String, required: true },
  name: {type: String, required: true},
  qty: {type: Number, required: true},
  sku: {type: String, required: false},
  variant: {type: String, required: true}
});

const Sales = mongoose.model('Sales', SalesSchema);

module.exports = Sales;
