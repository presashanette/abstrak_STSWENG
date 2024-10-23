const mongoose = require('mongoose');
const Product = require('./Product');
// const Sales = require('./Sales');
const User = require('./User');
const OrderInfo = require('./OrderInfo');
const Expense = require('./Expense');   
const AbstrakCol = require('./AbstrakCol');
const Audit = require('./Audit');

function connect () {
    mongoose.connect(process.env.MONGODB_URI)
    // add models here
    mongoose.model('Product', Product.schema);
    mongoose.model('User', User.schema);
    mongoose.model('Expense', Expense.schema);
    mongoose.model('AbstrakCol', AbstrakCol.schema);
    mongoose.model('OrderInfo', OrderInfo.schema);
    mongoose.model('Audit', Audit.schema);
}

module.exports = connect;