const { MessageEmbed } = require('discord.js');
const config = require('../config/config');

const logSystemMessage = async (client, message) => {
    try {
        const logChannel = await client.channels.fetch(config.logChannelId);
        await logChannel.send(message);
    } catch (error) {
        console.error('Error logging system message:', error);
    }
};

const logActiveAttacks = async (client) => {
    try {
        const logChannel = await client.channels.fetch(config.logChannelId);
        const activeAttacks = client.apiDetails.map(api => `${api.name} active attacks: ${api.activeAttacks}/${api.maxConcurrent}`).join('\n');
        await logChannel.send(activeAttacks);
    } catch (error) {
        console.error('Error logging active attacks:', error);
    }
};

module.exports = {
    logSystemMessage,
    logActiveAttacks,
};
