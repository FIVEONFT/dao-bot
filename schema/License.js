const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LicenseSchema = new Schema({
    license: String,
    discordId: String,
    serverId: String,
    roleId: String,
    discordToken: {
        access_token: String,
        expires_in: Number,
        refresh_token: String,
        scope: String,
        token_type: String
    },
    expiresAt: String
});

const License = mongoose.model('License', LicenseSchema);

module.exports = License;