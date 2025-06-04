import express from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';


const router = express.Router();
const generateToken = ({ userId, username, email }) => {
    const token = jwt.sign({ id: userId, username, email }, process.env.JWT_SECRET, { expiresIn: '17d' });
    return token;   
}
router.post('/register', async(req, res) => {
    try {
        const {email, username, password, profilePicture} = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Email, username, and password are required' });
        }
        if(password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        if(username.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }
         const hashedPassword = await bcryptjs.hash(password, 10);
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
            profilePicture: profilePicture || "https://example.com/default-profile.png", // Default profile picture
        })
        await newUser.save();
        const token = generateToken({userId: newUser._id, username: newUser.username, email: newUser.email});
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
            },
            token: token,
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
        
    }
})
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = generateToken({ userId: user._id, username: user.username, email: user.email });
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            token: token,
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;