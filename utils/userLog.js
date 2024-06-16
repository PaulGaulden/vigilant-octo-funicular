const { PermissionsBitField, ChannelType } = require('discord.js');

// Function to get or create a log channel for a user by their username
const getUserLogChannel = async (client, guildId, username, userId) => {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error('Guild not found.');
        return null;
    }

    // Check if the log channel already exists
    let logChannel = guild.channels.cache.find(channel => channel.name === `log-${username}`);
    if (!logChannel) {
        // Create a new text channel for the user
        logChannel = await guild.channels.create({
            name: `log-${username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: userId,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: client.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                }
            ],
        }).catch(error => {
            console.error('Error creating log channel:', error);
        });
    }
    return logChannel;
};

// Function to log a message to a user's log channel
const logUserMessage = async (client, guildId, username, userId, message) => {
    const logChannel = await getUserLogChannel(client, guildId, username, userId);
    if (logChannel) {
        const timestamp = new Date().toISOString();
        await logChannel.send(`**[${timestamp}]** ${message}`);
    } else {
        console.error(`Failed to log message for user ${username}`);
    }
};

module.exports = { logUserMessage };
