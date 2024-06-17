// const mongoose = require('mongoose');

// const OrderInfoSchema = new mongoose.Schema({
//   orderNo: { type: String, required: true },
//   date: { type: Date, required: true },
//   totalOrderQuantity: { type: Number, required: true },
//   items: [{ 
//     name: String, 
//     quantity: Number 
//   }],
//   paymentStatus: { type: String, required: true },
//   paymentMethod: { type: String, required: true },
//   fulfillmentStatus: { type: String, required: true },
//   total: { type: Number, required: true }
// });

// module.exports = mongoose.model('OrderInfo', OrderInfoSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Item schema
const itemSchema = new Schema({
  itemName: String,
  variant: String,
  sku: String,
  quantity: Number,
  quantityRefunded: Number,
  price: Number,
  weight: Number,
  customText: String,
  depositAmount: Number,
  deliveryTime: String,
});


// Order schema
const orderSchema = new Schema({
  orderNumber: String,
  dateCreated: Date,
  time: String,
  fulfillBy: String,
  totalOrderQuantity: Number,
  contactEmail: String,
  noteFromCustomer: String,
  additionalCheckoutInfo: String,
  items: [itemSchema],
  paymentStatus: String,
  paymentMethod: String,
  couponCode: String,
  giftCardAmount: Number,
  shippingRate: Number,
  totalTax: Number,
  total: Number,
  currency: String,
  refundedAmount: Number,
  netAmount: Number,
  additionalFees: Number,
  fulfillmentStatus: String,
  trackingNumber: String,
  fulfillmentService: String,
  deliveryMethod: String,
  orderedFrom: String,
  shippingLabel: String,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;