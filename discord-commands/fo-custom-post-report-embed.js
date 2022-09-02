const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fo-custom-post-report-embed')
        .setDescription('Post a custom report embed.')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Text')
                .setRequired(true))
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
        const title = interaction.options.getString('title');
        const text = interaction.options.getString('text');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('submitReport')
                    .setLabel('Submit Report')
                    .setStyle(ButtonStyle.Success)
            );

        const exampleEmbed = new EmbedBuilder()
            .setColor('00ffbf')
            .setTitle(title)
            .setAuthor({
                name: 'FIVE-O',
                url: 'https://five-o.app',
                iconURL: 'https://five-o.app/android-chrome-192x192.png'
            })
            .setDescription(text);

        channel.send({ embeds: [exampleEmbed], components: [row] });

        await interaction.editReply({
            content: 'Message sent',
            ephemeral: true
        });

    }
};