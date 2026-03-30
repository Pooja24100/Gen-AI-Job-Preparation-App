const userModel = require('../models/user.model');

function serializeProfile(user) {
    return {
        id: user._id,
        name: user.fullName || user.username,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
        bio: user.bio || '',
    };
}

async function createProfileController(req, res) {
    try {
        const { name, email, avatar, bio } = req.body;

        const user = await userModel.findById(req.user.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: user._id } });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use',
                });
            }

            user.email = email;
        }

        user.fullName = typeof name === 'string' ? name.trim() : user.fullName;
        user.avatar = typeof avatar === 'string' ? avatar.trim() : user.avatar;
        user.bio = typeof bio === 'string' ? bio.trim() : user.bio;

        await user.save();

        return res.status(201).json({
            success: true,
            message: 'Profile created successfully',
            data: serializeProfile(user),
        });
    } catch (error) {
        console.error('Error creating profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create profile',
        });
    }
}

async function getProfileController(req, res) {
    try {
        const user = await userModel.findById(req.user.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            data: serializeProfile(user),
        });
    } catch (error) {
        console.error('Error fetching profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
        });
    }
}

async function updateProfileController(req, res) {
    try {
        const { name, email, avatar, bio } = req.body;

        const user = await userModel.findById(req.user.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email, _id: { $ne: user._id } });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already in use',
                });
            }

            user.email = email;
        }

        if (typeof name === 'string') {
            user.fullName = name.trim();
        }

        if (typeof avatar === 'string') {
            user.avatar = avatar.trim();
        }

        if (typeof bio === 'string') {
            user.bio = bio.trim();
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: serializeProfile(user),
        });
    } catch (error) {
        console.error('Error updating profile:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
}

module.exports = {
    createProfileController,
    getProfileController,
    updateProfileController,
};
