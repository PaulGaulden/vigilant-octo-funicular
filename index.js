const { Client, GatewayIntentBits } = require('discord.js');
const { logSystemMessage, logActiveAttacks } = require('./utils/logger');
const { handleInteraction } = require('./handlers/interactionHandler');
const config = require('./config/config');
const { sendRequest } = require('./utils/api');
const { sanitizeInput, isValidIP, isValidPort } = require('./utils/utils');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.userActiveCommands = {};
client.apiDetails = require('./utils/api').apiDetails;
client.selectApi = require('./utils/api').selectApi;
client.getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

client.once('ready', async () => {
    await logSystemMessage(client, 'Bot started.');
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
    await handleInteraction(interaction, client);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot && !message.webhookId) return;

    const channelTime = config.channelTimeMap[message.channel.id];
    if (channelTime) {
        const [ip, port] = message.content.split(':');
        if (isValidIP(ip) && isValidPort(parseInt(port))) {
            const sanitizedIp = sanitizeInput(ip);
            const sanitizedPort = parseInt(port);
            const time = channelTime;

            await logSystemMessage(client, `Received IP:PORT message in channel ${message.channel.name}: ${sanitizedIp}:${sanitizedPort} for ${time} seconds`);

            await sendRequest(client, message.author, message, sanitizedIp, sanitizedPort, time);
        } else {
            console.log('Invalid IP:PORT format');
        }
    }
});

client.login(config.discordToken);
