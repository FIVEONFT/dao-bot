const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, TextInputBuilder, ModalBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-submit-report')
        .setDescription('Submit a scam report.'),
    async execute(interaction, DiscordController) {
        const modal = new ModalBuilder()
            .setCustomId('submitReportModal')
            .setTitle('Submit Report');
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('website')
            .setLabel('Website URL (wildcards accepted)')
            .setPlaceholder('scamwebsite.com')
            .setStyle('Short')
            .setRequired(true);
        const hobbiesInput = new TextInputBuilder()
            .setCustomId('notes')
            .setLabel('Notes (optional)')
            .setStyle('Paragraph')
            .setRequired(false);
        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);
        modal.addComponents(firstActionRow, secondActionRow);
        await interaction.showModal(modal);
    }
};