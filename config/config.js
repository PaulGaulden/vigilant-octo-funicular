require('dotenv').config();

const config = {
    discordToken: process.env.DISCORD_TOKEN,
    logChannelId: '1248679428989653103', // Ensure this ID is correct
    warningsLogChannelId: '1250256017095262248',
    logServerId: '1245778838814720212',
    restrictedRoleId: '1251341007610581044',
    authorizedUserId: '1219394824277590039',
    reviewChannelId: '1251602722495397939',
    channelTimeMap: {
        '1251331195363397642': 30, // quick-send-30
        '1251331229014429738': 45, // quicksend-45
        '1251331260668968961': 60, // quick-send-60
        '1251331319363797113': 75, // quicksend-75
        '1251331284584632391': 80, // quick-send-80
        '1251331358136074270': 100, // quicksend-100
        '1251331416076189767': 110, // quick-send-110
        '1251331438847066202': 120, // quick-send-120
        '1251602722495397939': 60 // Review channel with specific time
    }
};

module.exports = config;
