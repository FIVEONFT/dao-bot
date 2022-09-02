const Guild = require('../schema/Guild.js');

class GuildController {

    getGuildByDiscordId(discordId) {
        return Guild.findOne({ discordId });
    }

    async createGuildIfNotExists(guild) {
        const guildExists = await this.getGuildByDiscordId(guild.id);
        if (guildExists) return guildExists;
        const newGuild = new Guild({
            discordId: guild.id,
            discordName: guild.name
        });
        return await newGuild.save();
    }

    getAllGuilds() {
        return Guild.find({
            isIgnored: false
        });
    }
}

module.exports = new GuildController();