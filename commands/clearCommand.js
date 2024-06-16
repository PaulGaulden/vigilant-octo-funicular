const clearChannels = async (client, channelTimeMap) => {
    for (const channelId of Object.keys(channelTimeMap)) {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            try {
                const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                await channel.bulkDelete(fetchedMessages);
                console.log(`Cleared messages in channel ${channel.name}`);
            } catch (error) {
                console.error(`Failed to clear messages in channel ${channel.name}:`, error);
            }
        }
    }
};

module.exports = { clearChannels };
