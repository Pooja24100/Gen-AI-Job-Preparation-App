const express = require('express');
const authController = require('../controllers/auth.controller');
const authRouter = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

/** 
* @route POST /api/auth/register
* @desc Register a new user
* @access Public
**/
authRouter.post('/register', authController.registerUserController);

/** 
* @route POST /api/auth/login
* @desc login user with email and password
* @access Public
**/
authRouter.post('/login', authController.loginUserController);  

/** 
* @route GET /api/auth/logout
* @desc logout user by blacklisting the token
* @access Public
**/
authRouter.get('/logout', authController.logoutUserController);

/**
 * @route GET/api/auth/get-me
 * @description get the current logged in user details
 * @access Private
 **/
authRouter.get('/get-me', authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;