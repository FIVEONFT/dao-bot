const { SlashCommandBuilder } = require('@discordjs/builders');
const GuildController = require('../controllers/GuildController.js');
const AggregateController = require('../controllers/AggregateController.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-unset-aggregate-channel')
        .setDescription('Unset aggregate channel.'),
    async execute(interaction, DiscordController) {

        if (!DiscordController.isInteractionUserAdministrator(interaction)) {
            await interaction.reply({ content: `Invalid access level.`, ephemeral: true });
            return;
        }

        await interaction.deferReply({
            ephemeral: true
        });

        const guildExists = await GuildController.getGuildByDiscordId(interaction.guildId);

        if (!guildExists) {
            await interaction.editReply({
                content: 'An error has occurred, please contact FIVE-O support.',
                ephemeral: true
            });
        }

        if (!guildExists.settings) guildExists.settings = {};
        guildExists.settings.aggregateChannel = '';
        await guildExists.save();

        AggregateController.addWatchChannel({
            channelId: '',
            guildId: guildExists.discordId,
            guildName: guildExists.discordName
        });

        await interaction.editReply({
            content: 'Aggregate channel unset.',
            ephemeral: true
        });

    }
};