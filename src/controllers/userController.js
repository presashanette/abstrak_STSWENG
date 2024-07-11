const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Adjust the path to your User model
const users = require('./sampleUsers.json'); // Adjust the path to your JSON file

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

createUsers();
