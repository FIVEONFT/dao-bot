const { dirname } = require('node:path');
const appDir = dirname(require.main.filename);

const config = {
    isDev: !!process.env.IS_DEV,

    db: {
        driver: process.env.DB_DRIVER
    },

    vercel: {
        hook: process.env.VERCEL_HOOK,
        timeout: 30000
    },

    discord: {
        appId: process.env.DISCORD_APP_ID,
        key: process.env.DISCORD_KEY,
        token: process.env.DISCORD_TOKEN,

        commandsPath: `${appDir}/discord-commands`,

        masterServerId: '997264539794014330',
        masterReportsChannelId: '998573151812341911',
        masterAggregatedChannelId: '1014107711341867058'
    },

    reportsApi: process.env.REPORTS_API,

    commandsVersion: 6,

    dntsPerReport: 5
};

module.exports = config;