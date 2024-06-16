const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

const whitelistFile = 'whitelist.json';
let whitelist = [];

try {
    if (fs.existsSync(whitelistFile)) {
        const data = fs.readFileSync(whitelistFile, 'utf8');
        if (data.trim()) {
            whitelist = JSON.parse(data);
        }
    }
} catch (error) {
    console.error('Error reading whitelist file:', error);
}

const logMessage = async (client, logChannelId, message) => {
    const logChannel = await client.channels.fetch(logChannelId);
    if (logChannel) {
        logChannel.send(message);
    } else {
        console.error('Log channel not found.');
    }
};

const handleWhitelistCommand = async (interaction, client, logChannelId) => {
    const { options, guild } = interaction;
    const serverOwner = guild.ownerId;

    if (interaction.user.id !== serverOwner) {
        console.log('Permission denied for whitelist command');
        await logMessage(client, logChannelId, 'Permission denied for whitelist command');
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const userToWhitelist = options.getUser('user');

    if (whitelist.includes(userToWhitelist.id)) {
        console.log(`${userToWhitelist.tag} is already whitelisted`);
        await logMessage(client, logChannelId, `${userToWhitelist.tag} is already whitelisted`);
        return interaction.reply({ content: `${userToWhitelist.tag} is already whitelisted.`, ephemeral: true });
    }

    whitelist.push(userToWhitelist.id);
    fs.writeFileSync(whitelistFile, JSON.stringify(whitelist, null, 2));
    console.log(`${userToWhitelist.tag} has been whitelisted`);
    await logMessage(client, logChannelId, `${userToWhitelist.tag} has been whitelisted`);

    return interaction.reply({ content: `${userToWhitelist.tag} has been whitelisted.`, ephemeral: true });
};

const handleViewWhitelistCommand = async (interaction, client, logChannelId) => {
    const { guild } = interaction;
    const serverOwner = guild.ownerId;

    if (interaction.user.id !== serverOwner) {
        console.log('Permission denied for viewwhitelist command');
        await logMessage(client, logChannelId, 'Permission denied for viewwhitelist command');
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const whitelistUsernames = await Promise.all(whitelist.map(async (id) => {
        try {
            const user = await client.users.fetch(id);
            return user ? user.tag : 'Unknown User';
        } catch (error) {
            console.error(`Error fetching user with ID ${id}:`, error);
            await logMessage(client, logChannelId, `Error fetching user with ID ${id}: ${error.message}`);
            return `Error fetching user with ID ${id}`;
        }
    }));

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Whitelisted Users')
        .setDescription(whitelistUsernames.join('\n'))
        .setTimestamp();

    console.log('Displaying whitelisted users');
    await logMessage(client, logChannelId, 'Displaying whitelisted users');
    return interaction.reply({ embeds: [embed], ephemeral: true });
};

const handleBlacklistCommand = async (interaction, client, logChannelId) => {
    const { options, guild } = interaction;
    const serverOwner = guild.ownerId;

    if (interaction.user.id !== serverOwner) {
        console.log('Permission denied for blacklist command');
        await logMessage(client, logChannelId, 'Permission denied for blacklist command');
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const userToBlacklist = options.getUser('user');

    if (!whitelist.includes(userToBlacklist.id)) {
        console.log(`${userToBlacklist.tag} is not whitelisted`);
        await logMessage(client, logChannelId, `${userToBlacklist.tag} is not whitelisted`);
        return interaction.reply({ content: `${userToBlacklist.tag} is not whitelisted.`, ephemeral: true });
    }

    whitelist = whitelist.filter(id => id !== userToBlacklist.id);
    fs.writeFileSync(whitelistFile, JSON.stringify(whitelist, null, 2));
    console.log(`${userToBlacklist.tag} has been blacklisted`);
    await logMessage(client, logChannelId, `${userToBlacklist.tag} has been blacklisted`);

    return interaction.reply({ content: `${userToBlacklist.tag} has been blacklisted.`, ephemeral: true });
};

module.exports = {
    handleWhitelistCommand,
    handleViewWhitelistCommand,
    handleBlacklistCommand
};
