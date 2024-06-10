const mongoose = require('mongoose');

const OrderInfoSchema = new mongoose.Schema({
  orderNo: { type: String, required: true },
  date: { type: Date, required: true },
  totalOrderQuantity: { type: Number, required: true },
  items: [{ 
    name: String, 
    quantity: Number 
  }],
  paymentStatus: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  fulfillmentStatus: { type: String, required: true },
  total: { type: Number, required: true }
});

module.exports = mongoose.model('OrderInfo', OrderInfoSchema);
