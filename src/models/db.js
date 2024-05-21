const mongoose = require('mongoose');
const Product = require('./Product');
// const Sales = require('./Sales');
const User = require('./User');
const Expense = require('./Expense');   
const AbstrakCol = require('./AbstrakCol');

function connect () {
    mongoose.connect(process.env.MONGODB_URI)
    // add models here
    mongoose.model('Product', Product.schema);
    mongoose.model('User', User.schema);
    mongoose.model('Expense', Expense.schema);
    mongoose.model('AbstrakCol', AbstrakCol.schema);
}

module.exports = connect;