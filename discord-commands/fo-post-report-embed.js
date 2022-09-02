const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-post-report-embed')
        .setDescription('Post report embed.')
        .addChannelOption(option =>
            option.setName('destination')
                .setDescription('The channel where you want the embed to be pasted')
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

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('submitReport')
                    .setLabel('Submit Report')
                    .setStyle(ButtonStyle.Success)
            );

        const exampleEmbed = new EmbedBuilder()
            .setColor('00ffbf')
            .setTitle('Submit Report')
            .setAuthor({
                name: 'FIVE-O'
            })
            .setThumbnail('https://five-o.app/android-chrome-192x192.png')
            .setDescription('Submit a harmful URL using the button below.')
            .addFields(
                {
                    name: 'Extension',
                    value: 'Download the browser extension to get warned whenever you access a harmful site from our growing database.\r\nhttps://five-o.app'
                }
            );

        channel.send({ embeds: [exampleEmbed], components: [row] });

        await interaction.editReply({
            content: 'Message sent',
            ephemeral: true
        });

    }
};