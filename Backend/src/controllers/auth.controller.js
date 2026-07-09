const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
};

function createAuthToken(user) {
    return jwt.sign(
        { user: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
}

/* 
@name registerUserController
@desc Register a new user, expects username, email, and password in the request body
@access Public
*/
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide username, email, and password' 
            });
        }

        // Check if the user already exists
        const isUserAlreadyExists = await userModel.findOne({ $or: [{ username }, { email }] });
        if (isUserAlreadyExists) {
            return res.status(400).json({ message: 'Account already exists with this email address or username' });
        }
 
        const hash = await bcrypt.hash(password, 12);
        // Create a new user
        const user = new userModel({
            username,
            email,
            password: hash,
        });

        const token = createAuthToken(user);
        await user.save();
 
        res.cookie('token', token, cookieOptions);
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**  
 * @name loginUserController
 * @desc Login an existing user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = createAuthToken(user);

        // Set the token as a cookie
        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**  
 * @name logoutUserController
 * @desc Logout user by blacklisting the token
 * @access Public
 */
async function logoutUserController(req, res) {
    try {
        const token  = req.cookies.token;

        if (!token) {
            return res.status(400).json({ message: 'No token found' });
        }

        // Add the token to the blacklist
        if(token){
            await tokenBlacklistModel.create({ token });
        }

        // Clear the token cookie
        res.clearCookie('token', cookieOptions);

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/** 
 * @name getMeController
 * @desc Get the current logged in user details
 * @access Private
 */
async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.user)
        res.status(200).json({
            message: 'User details fetched successfully',
             user :
            {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                avatar: user.avatar,
            }
         });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
}           
module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
};
