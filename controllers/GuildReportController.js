const GuildReport = require('../schema/GuildReport.js');

class GuildReportController {

    getGuildReportByMasterMessageIdAndDiscordId({ masterMessageId, discordGuildId }) {
        return GuildReport.findOne({ masterMessageId, discordGuildId });
    }

    async handleMessageCreateUpdate(message, DiscordController) {
        await DiscordController.forEachGuild(async (guild, mongoGuild) => {

            try {

                const reportsChannel = mongoGuild?.settings?.reportsChannel;
                if (!reportsChannel) return;
                const guildReportExists = await this.getGuildReportByMasterMessageIdAndDiscordId({
                    masterMessageId: message.id,
                    discordGuildId: guild.id
                });

                const targetChannel = DiscordController.client.channels.cache.get(reportsChannel);

                if (guildReportExists) {
                    // update
                    const messageExists = await targetChannel.messages.fetch(guildReportExists.childMessageId);
                    await messageExists.edit({
                        content: message.content,
                        embeds: message.embeds
                    });
                } else {
                    // post
                    const messageSent = await targetChannel.send({
                        content: message.content,
                        embeds: message.embeds
                    });
                    const newGuildReport = new GuildReport({
                        masterMessageId: message.id,
                        discordGuildId: guild.id,
                        childMessageId: messageSent.id
                    });
                    await newGuildReport.save();
                }

            } catch (e) {

                console.log(e);

            }

        });
    }

    async handleMessageDelete(message, DiscordController) {
        await DiscordController.forEachGuild(async (guild, mongoGuild) => {

            try {

                const reportsChannel = mongoGuild?.settings?.reportsChannel;
                if (!reportsChannel) return;
                const guildReportExists = await this.getGuildReportByMasterMessageIdAndDiscordId({
                    masterMessageId: message.id,
                    discordGuildId: guild.id
                });

                const targetChannel = DiscordController.client.channels.cache.get(reportsChannel);

                if (guildReportExists) {
                    // delete
                    const messageExists = await targetChannel.messages.fetch(guildReportExists.childMessageId);
                    await messageExists.delete();
                    await guildReportExists.delete();
                }

            } catch (e) {
                console.log(e);
            }

        });
    }

}

module.exports = new GuildReportController();