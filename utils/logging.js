const { format } = require('util');

// Sanitize log messages to prevent log injection
function sanitizeLogMessage(message) {
    if (typeof message !== 'string') {
        return format(message);
    }
    
    // Remove potential CRLF injection characters
    return message.replace(/[\n\r\t]/g, ' ');
}

function secureLog(level, message, metadata = {}) {
    const sanitizedMessage = sanitizeLogMessage(message);
    const sanitizedMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
        acc[key] = sanitizeLogMessage(value);
        return acc;
    }, {});
    
    // Use your preferred logging library here
    console.log(`[${level}] ${sanitizedMessage}`, sanitizedMetadata);
}

module.exports = {
    secureLog,
    sanitizeLogMessage
};