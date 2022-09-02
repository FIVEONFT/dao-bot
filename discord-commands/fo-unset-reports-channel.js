const { SlashCommandBuilder } = require('@discordjs/builders');
const GuildController = require('../controllers/GuildController.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-unset-reports-channel')
        .setDescription('Unset reports channel.'),
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
        guildExists.settings.reportsChannel = '';
        await guildExists.save();

        await interaction.editReply({
            content: 'Reports channel unset.',
            ephemeral: true
        });

    }
};