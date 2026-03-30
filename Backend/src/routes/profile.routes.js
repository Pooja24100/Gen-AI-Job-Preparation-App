const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');

const profileRouter = express.Router();

profileRouter.post('/', authMiddleware.authUser, profileController.createProfileController);
profileRouter.get('/', authMiddleware.authUser, profileController.getProfileController);
profileRouter.put('/', authMiddleware.authUser, profileController.updateProfileController);

module.exports = profileRouter;
