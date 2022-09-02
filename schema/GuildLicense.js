const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuildLicenseSchema = new Schema({
    discordId: String,
    roleId: String,
    address: String
}, { timestamps: true });

const GuildLicense = mongoose.model('GuildLicense', GuildLicenseSchema);

module.exports = GuildLicense;