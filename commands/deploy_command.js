const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();

const commands = [
    new SlashCommandBuilder()
        .setName('lag')
        .setDescription('Executes the L4 API and displays the response code')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('The target IP address')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('The target port')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The time for the attack in seconds')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('burst')
        .setDescription('Executes the burst attack with intervals')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('The target IP address')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('port')
                .setDescription('The target port')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('The total time for the attack in seconds')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('interval')
                .setDescription('The interval duration for each burst in seconds')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks the bot\'s latency'),
    new SlashCommandBuilder()
        .setName('media')
        .setDescription('Submits a media link to a specified platform')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The media link to submit')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('The platform of the media link')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows the current number of active attacks')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error reloading application (/) commands:', error);
    }
})();
