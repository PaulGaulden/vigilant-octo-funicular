const axios = require('axios');

const handlePingCommand = async (interaction, client, apiDetails, logMessage) => {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = client.ws.ping;

    console.log(`Interaction Latency: ${latency}ms, API Latency: ${apiLatency}ms`);

    // Measure latency to API SERVER
    const start = Date.now();
    let httpLatency;
    try {
        await axios.get(apiDetails[0].url, {
            params: {
                api_key: apiDetails[0].apiKey,
                user: apiDetails[0].userId,
            }
        });
        httpLatency = Date.now() - start;
    } catch (error) {
        httpLatency = 'Error';
        console.error('Error fetching API SERVER:', error);
    }

    console.log(`HTTP Latency to API SERVER: ${httpLatency}`);
    logMessage(`Latency: ${latency}ms, API Latency: ${apiLatency}ms, HTTP Latency: ${httpLatency}ms`);

    await interaction.editReply(`🏓 Latency is ${latency}ms. API Latency is ${apiLatency}ms. HTTP Latency to API SERVER is ${httpLatency}ms`);
};

module.exports = { handlePingCommand };
