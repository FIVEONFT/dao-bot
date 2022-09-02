const Report = require('../schema/Report.js');
const UserController = require('./UserController.js');
const GuildController = require('./GuildController.js');
const ThrottleController = require('./ThrottleController.js');
const config = require('../config/config.js');
const fetch = require('isomorphic-fetch');

class ReportController {

    getCount(query = {}) {
        return Report.count(query);
    }

    createReport({
                     website,
                     notes,
                     belongsTo
                 }) {
        return new Report({
            website,
            notes,
            belongsTo
        }).save();
    }

    async submitReport(interaction, DiscordController) {

        await interaction.deferReply({
            ephemeral: true
        });

        const guildExists = await GuildController.getGuildByDiscordId(interaction.guild.id);
        if (guildExists.isIgnored) {
            await interaction.editReply({
                content: 'A report could not be submitted at this time. Please try again later.',
                ephemeral: true
            });
            return;
        }

        const throttleRes = ThrottleController.canUser({ userId: interaction.user.id });
        if (!throttleRes?.success) {
            await interaction.editReply({
                content: `Report could not be submitted. Please wait ${throttleRes.waitSeconds} seconds.`,
                ephemeral: true
            });
            return;
        }

        const matcher = await import('matcher');

        let website = interaction.fields.getTextInputValue('website').replace('http://', '').replace('https://', '');
        if (website.endsWith('/')) website = website.slice(0, -1);
        const notes = interaction.fields.getTextInputValue('notes');
        const belongsToUser = await UserController.createUserIfNotExists(interaction.user);

        const websiteRegExp = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);
        if (!websiteRegExp.test(website)) {
            await interaction.editReply({
                content: 'Report could not be submitted. Website is invalid.',
                ephemeral: true
            });
            return;
        }

        let currentReportsFetchJSON = [];
        try {
            const currentReportsFetch = await fetch(config.reportsApi);
            currentReportsFetchJSON = await currentReportsFetch.json();
        } catch (e) {
            // ..
        }
        for (let i = 0; i < currentReportsFetchJSON.length; i++) {
            if (currentReportsFetchJSON[i].website === website || matcher.isMatch(currentReportsFetchJSON[i].website, website)) {
                await interaction.editReply({
                    content: 'Report could not be submitted; this website has already been reported.',
                    ephemeral: true
                });
                return;
            }
        }

        let newReport;
        try {
            newReport = await this.createReport({
                website,
                notes,
                belongsTo: belongsToUser._id
            });
        } catch (e) {
            await interaction.editReply({
                content: 'Report could not be submitted. Maybe this website is already reported.',
                ephemeral: true
            });
            return;
        }

        const userReportsCount = await this.getCount({
            belongsTo: belongsToUser._id
        });

        await interaction.editReply({
            content: `Your submission regarding \`${website}\` was received, thanks for helping keep everyone safe. You have submitted ${userReportsCount} reports.`,
            ephemeral: true
        });

        newReport.externalGuildDiscordId = interaction.guild.id;

        await newReport.save();
    }
}

module.exports = new ReportController();