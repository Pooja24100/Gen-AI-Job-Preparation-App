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

const tokenBlacklistModel = mongoose.model('BlacklistTokens', blacklistTokenSchema);

module.exports = tokenBlacklistModel;