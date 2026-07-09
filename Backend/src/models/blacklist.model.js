const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is required to be added in the blacklist'],
    }
}, {
    timestamps: true,
}
);

blacklistTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const tokenBlacklistModel = mongoose.model('BlacklistTokens', blacklistTokenSchema);

module.exports = tokenBlacklistModel;
