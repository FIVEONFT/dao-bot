const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuildSchema = new Schema({
    discordId: String,
    discordName: String,
    isDev: {
        type: Boolean,
        default: false
    },
    isIgnored: {
        type: Boolean,
        default: false
    },
    settings: {
        reportsChannel: String,
        aggregateChannel: String
    },
    commandsVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Guild = mongoose.model('Guild', GuildSchema);

module.exports = Guild;