const validator = require('validator');

// Function to sanitize input strings
const sanitizeInput = (input) => {
    return validator.escape(input);
};

// Function to validate IP address
const isValidIP = (ip) => {
    return validator.isIP(ip);
};

// Function to validate port number
const isValidPort = (port) => {
    return validator.isInt(port.toString(), { min: 1, max: 65535 });
};

// Function to validate time (duration in seconds)
const isValidTime = (time) => {
    return validator.isInt(time.toString(), { min: 1 });
};

// Function to validate interval (duration in seconds)
const isValidInterval = (interval) => {
    return validator.isInt(interval.toString(), { min: 1 });
};

module.exports = {
    sanitizeInput,
    isValidIP,
    isValidPort,
    isValidTime,
    isValidInterval,
};
