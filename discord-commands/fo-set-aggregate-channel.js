const { SlashCommandBuilder } = require('@discordjs/builders');
const GuildController = require('../controllers/GuildController.js');
const AggregateController = require('../controllers/AggregateController.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-set-aggregate-channel')
        .setDescription('Set aggregate channel.')
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('The channel where your users post harmful urls')
                .setRequired(true)),
    async execute(interaction, DiscordController) {

        if (!DiscordController.isInteractionUserAdministrator(interaction)) {
            await interaction.reply({ content: `Invalid access level.`, ephemeral: true });
            return;
        }

        await interaction.deferReply({
            ephemeral: true
        });

        const channel = interaction.options.getChannel('destination');

        const guildExists = await GuildController.getGuildByDiscordId(interaction.guildId);

        if (!guildExists) {
            await interaction.editReply({
                content: 'An error has occurred, please contact FIVE-O support.',
                ephemeral: true
            });
        }

        if (!guildExists.settings) guildExists.settings = {};
        guildExists.settings.aggregateChannel = channel.id;
        await guildExists.save();

        AggregateController.addWatchChannel({
            channelId: channel.id,
            guildId: guildExists.discordId,
            guildName: guildExists.discordName
        });

        await interaction.editReply({
            content: 'Aggregate channel set.',
            ephemeral: true
        });

    }
};