const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//const User = require('./models/User'); // Adjust the path to your User model
//const users = require('./sampleUsers.json'); // Adjust the path to your JSON file
const users = require('../models/data/data-users.json');
const User = require('../models/User')

/*
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

async function createUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        for (let user of users) {
            user.password = await hashPassword(user.password);
            const newUser = new User(user);
            await newUser.save();
        }

        console.log('Users have been created');
        mongoose.disconnect();
    } catch (error) {
        console.error('Error creating users:', error);
    }
}
*/
async function viewDashboard(req, res) {
    try {
        const admins = await User.find({ role: 'admin'}).lean();
        const adminCount = admins.length;

        const nonAdmins = await User.find({ role: { $ne: 'admin'} }).lean();
        const nonAdminCount = nonAdmins.length;
        console.log(admins);
        console.log(nonAdmins);
        console.log("Admins: " + adminCount + " Non-admins: " + nonAdminCount);


        res.render('users', { adminCount, admins, nonAdminCount, nonAdmins });  // Pass the admins to the 'users' template
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error!");
    }
}

//createUsers();

module.exports = {
    viewDashboard
}