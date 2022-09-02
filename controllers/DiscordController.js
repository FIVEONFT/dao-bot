const config = require('../config/config.js');
const {
    Client,
    GatewayIntentBits
} = require('discord.js');
const fs = require('node:fs');
// const UserController = require('../controllers/UserController.js');
const GuildController = require('../controllers/GuildController.js');
const ReportController = require('../controllers/ReportController.js');
const GuildReportController = require('../controllers/GuildReportController.js');
const AggregateController = require('../controllers/AggregateController.js');

class DiscordController {

    constructor() {
        this.client = null;
        this.commands = {};
        this.commandFiles = null;
    }

    async initCommands(guild, mongoGuild) {

        console.log('[initCommands] init');

        if (!guild) return;
        if (guild.id === config.discord.masterServerId) return;

        console.log('[initCommands] start');

        // init commands
        this.commands = {};
        if (!this.commandFiles) this.commandFiles = fs.readdirSync(config.discord.commandsPath).filter(file => file.endsWith('.js'));

        let addCommands = [];
        for (const file of this.commandFiles) {
            if (file.startsWith('_')) continue;
            const command = require(`${config.discord.commandsPath}/${file}`);
            if (config.isDev && !command.data.name.startsWith('dev-')) command.data.name = `dev-${command.data.name}`;
            // await guild.commands.create(command.data);
            addCommands.push(command.data);
            if (!this.commands[command.data.name]) this.commands[command.data.name] = command;
        }

        try {
            await guild.commands.set(addCommands);
            if (mongoGuild) {
                mongoGuild.commandsVersion = config.commandsVersion;
                await mongoGuild.save();
            }

            console.log('[initCommands] done');
        } catch (e) {
            console.log('[DiscordController] could not set commands');
            console.log(e);
        }
    }

    createClient() {
        this.client = new Client({
            intents: [
                //     Guilds = 1,
                //     GuildMembers = 2,
                //     GuildBans = 4,
                //     GuildEmojisAndStickers = 8,
                //     GuildIntegrations = 16,
                //     GuildWebhooks = 32,
                //     GuildInvites = 64,
                //     GuildVoiceStates = 128,
                //     GuildPresences = 256,
                //     GuildMessages = 512,
                //     GuildMessageReactions = 1024,
                //     GuildMessageTyping = 2048,
                //     DirectMessages = 4096,
                //     DirectMessageReactions = 8192,
                //     DirectMessageTyping = 16384,
                //     MessageContent = 32768,
                //     GuildScheduledEvents = 65536
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
                // GatewayIntentBits.GuildMembers,
                // GatewayIntentBits.GuildPresences,
                // GatewayIntentBits.DirectMessages,
                // GatewayIntentBits.GuildMessages
            ]
        });
    }

    getGuildById(guildId) {
        return this.client.guilds.cache.find(guild =>
            guild.id === guildId);
    }

    async forEachGuild(cb) {
        const allGuilds = await GuildController.getAllGuilds();
        for (let i = 0; i < allGuilds.length; i++) {
            const getGuild = this.getGuildById(allGuilds[i].discordId);
            await cb(getGuild, allGuilds[i]);
        }
    }

    async initBot() {
        this.createClient();

        // on ready, init
        this.client.on('ready', async (client) => {
            console.log('[DiscordController] client ready');

            client.user.setActivity('https://five-o.app');

            // for each guild the bot has joined
            await this.forEachGuild(async (guild, mongoGuild) => {
                console.log(`[Five-o Public] ${guild.name} commands v${mongoGuild.commandsVersion}/${config.commandsVersion}`);

                if (mongoGuild.commandsVersion !== config.commandsVersion || (mongoGuild.isDev && config.isDev)) {
                    await this.initCommands(guild, mongoGuild);
                }

                AggregateController.addWatchChannel({
                    channelId: mongoGuild?.settings?.aggregateChannel || '',
                    guildId: mongoGuild.discordId,
                    guildName: mongoGuild.discordName
                });
            });
        });

        this.client.on('messageCreate', async (message) => {
            await AggregateController.onMessageCreate(message, this);
            if (message.guildId !== config.discord.masterServerId || message.channelId !== config.discord.masterReportsChannelId) return;
            setTimeout(async () => {
                await GuildReportController.handleMessageCreateUpdate(message, this);
            }, 1);
        });

        this.client.on('messageUpdate', async (oldMessage, message) => {
            if (message.guildId !== config.discord.masterServerId || message.channelId !== config.discord.masterReportsChannelId) return;
            setTimeout(async () => {
                await GuildReportController.handleMessageCreateUpdate(message, this);
            }, 1);
        });

        this.client.on('messageDelete', async (message) => {
            if (message.guildId !== config.discord.masterServerId || message.channelId !== config.discord.masterReportsChannelId) return;
            setTimeout(async () => {
                await GuildReportController.handleMessageDelete(message, this);
            }, 1);
        });

        // on guild create
        this.client.on('guildCreate', async (guild) => {
            if (guild.id === config.discord.masterServerId) return;
            await this.initCommands(guild);
            setTimeout(async () => {
                await GuildController.createGuildIfNotExists(guild);
            }, 1);
        });

        // on interaction
        this.client.on('interactionCreate', async interaction => {

            if (interaction.guild.id === config.discord.masterServerId) return;

            // handle commands
            if (interaction.isChatInputCommand()) {
                const command = this.commands[interaction.commandName];
                if (!command) return;
                try {
                    await command.execute(interaction, this);
                } catch (error) {
                    console.error('[DiscordController] Command exec error', interaction.commandName, error);
                }
            }

            // handle modals
            if (interaction.isModalSubmit()) {
                const modalCustomId = interaction.customId.split('_')[0];
                switch (modalCustomId) {
                    case 'submitReportModal':
                        await ReportController.submitReport(interaction, this);
                        break;
                }
            }

            // handle buttons
            if (interaction.isButton()) {
                const customIdFirstPart = interaction.customId.split('_')[0];
                switch (customIdFirstPart) {
                    case 'submitReport':
                        const commandSubmitReport = this.commands[`${config.isDev ? 'dev-' : ''}fo-submit-report`];
                        if (!commandSubmitReport) return;
                        await commandSubmitReport.execute(interaction, this);
                        break;
                }
            }
        });

        await this.client.login(config.discord.token);
    }

    isInteractionUserAdministrator(interaction) {
        return !!interaction.member.permissions.serialize().Administrator;
    }
}

module.exports = new DiscordController();