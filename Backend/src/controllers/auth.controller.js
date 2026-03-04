const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistModel = require('../models/blacklist.model');
const redis = require('../config/cache');
 
async function registerUser(req, res) {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isAlreadyRegistered) {
        return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new userModel({
        username,
        email,
        password: hash
    });

    await user.save();   // ✅ VERY IMPORTANT

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '3d' }
    );

    res.cookie('token', token);

    return res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}
   async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel
            .findOne({ email })
            .select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '3d' }
        );

        res.cookie('token', token);

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
async function getMe(req, res) {
    const user = await userModel.findById(req.user.id);
    res.status(200).json({message: 'User fetched successfully', user})
}
async function logoutUser(req, res) {
    const token = req.cookies.token;
    res.clearCookie('token');
   await redis.set(token, Date.now().toString(), 'EX', 60 * 60); // Blacklist token for 3 days
    res.status(200).json({ message: 'Logout successful' });
}
module.exports = { registerUser, loginUser, getMe , logoutUser};
// module.exports = { registerUser };