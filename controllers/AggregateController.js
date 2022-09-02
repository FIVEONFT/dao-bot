const { EmbedBuilder } = require('discord.js');
const config = require('../config/config.js');

class AggregateController {

    constructor() {
        this.watchChannels = [];
    }

    getWatchChannelByGuildId(guildId) {
        return this.watchChannels.find(item => item.guildId === guildId);
    }

    getWatchChannelByChannelId(channelId) {
        return this.watchChannels.find(item => item.channelId === channelId);
    }

    addWatchChannel({ channelId, guildId, guildName }) {
        const watchChannelExists = this.getWatchChannelByGuildId(guildId);
        if (watchChannelExists) {
            watchChannelExists.channelId = channelId;
            watchChannelExists.guildName = guildName;
            return;
        }
        this.watchChannels.push({ channelId, guildId, guildName });
    }

    async onMessageCreate(message, DiscordController) {
        if (message?.author?.bot) return;
        const watchChannelExists = this.getWatchChannelByChannelId(message.channelId);
        if (!!watchChannelExists && (!!message?.attachments?.size || !!message?.content)) {

            const exampleEmbed = new EmbedBuilder()
                .setColor('00ffbf')
                .setTitle(watchChannelExists.guildName)
                .setAuthor({
                    name: `${message.author.username}#${message.author.discriminator}`,
                    iconURL: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.jpeg`
                })
                .setDescription(message.content || 'N/A');

            if (!!message?.attachments?.size) {
                const attach = message.attachments.first();
                exampleEmbed.setImage(attach.url);
            }

            const aggregateMessage = {
                embeds: [exampleEmbed]
            };

            const targetChannel = DiscordController.client.channels.cache.get(config.discord.masterAggregatedChannelId);
            await targetChannel.send(aggregateMessage);
        }
    }
}

module.exports = new AggregateController();