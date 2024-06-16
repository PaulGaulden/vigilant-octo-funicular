const axios = require('axios');

const webhookUrl = 'https://discord.com/api/webhooks/1251353139001556992/f3xg626XzbZVlu7ERsfsUygrYXG8XofzRCu23j59AS8Ci-E9s81lmI5TcqWuqon0VAWT';

const handleMediaCommand = async (interaction) => {
    const link = interaction.options.getString('link');
    const platform = interaction.options.getString('platform');

    try {
        await axios.post(webhookUrl, {
            content: `New media link submitted:\n**Link**: ${link}\n**Platform**: ${platform}`
        });
        await interaction.reply({ content: 'Media link sent successfully!', ephemeral: true });
    } catch (error) {
        console.error('Error sending media link:', error);
        await interaction.reply({ content: 'Failed to send media link.', ephemeral: true });
    }
};

module.exports = { handleMediaCommand };
