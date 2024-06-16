const { handlePingCommand } = require('../commands/pingCommand');
const { handleLagCommand } = require('../commands/lagCommand');
const { handleBurstCommand } = require('../commands/burstCommand');
const { handleMediaCommand } = require('../commands/mediaCommand');
const { logSystemMessage, logActiveAttacks } = require('../utils/logger');
const { apiDetails } = require('../utils/api');

const handleInteraction = async (interaction, client) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    await logSystemMessage(client, `Received command: ${commandName} from user ${interaction.user.tag}`);
    console.log(`Received command: ${commandName} from user ${interaction.user.tag}`);

    try {
        if (commandName === 'status') {
            await logSystemMessage(client, 'Displaying status of active attacks');
            const statusMessage = apiDetails.map(api => `${api.name} active attacks: ${api.activeAttacks}/${api.maxConcurrent}`).join('\n');
            return interaction.reply({ content: statusMessage, ephemeral: true });
        }

        if (commandName === 'ping') {
            await handlePingCommand(interaction, client, logSystemMessage);
        }

        if (commandName === 'lag') {
            await handleLagCommand(interaction, client, client.userActiveCommands, client.selectApi, apiDetails, logActiveAttacks);
        }

        if (commandName === 'burst') {
            await handleBurstCommand(interaction, client.userActiveCommands, apiDetails, logSystemMessage, client.getCurrentTimestamp);
        }

        if (commandName === 'media') {
            await handleMediaCommand(interaction);
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        await logSystemMessage(client, `Error handling interaction: ${error.message}`);
        if (!interaction.replied) {
            await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true });
        }
    }
};

module.exports = { handleInteraction };
