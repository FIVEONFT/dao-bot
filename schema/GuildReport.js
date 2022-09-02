const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuildReportSchema = new Schema({
    discordGuildId: String,
    masterMessageId: String,
    childMessageId: String
});

const GuildReport = mongoose.model('GuildReport', GuildReportSchema);

module.exports = GuildReport;