const User = require('../models/User');

async function signup(req, res) {
    const { firstName, lastName, username, password, email } = req.body;
    console.log(`Signup attempt for username: ${username}`);

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Username is already taken." });
        }

        const newUser = User({
                firstName,
                lastName,
                password,
                email,
                username,
                role: "user"
            });
        await newUser.save().then(() => console.log('User created successfully'));

        return res.status(201).json({ success: true, redirectUrl: "/login" });
    } catch (error) {
        console.error('Error during signup process:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { signup };