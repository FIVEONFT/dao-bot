const DiscordController = require('./controllers/DiscordController.js');

module.exports = async function () {
    await DiscordController.initBot();
};