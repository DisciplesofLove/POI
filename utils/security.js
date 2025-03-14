const crypto = require('crypto');

// Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
        return false;
    }
    
    // Use crypto's timingSafeEqual to prevent timing attacks
    try {
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        return crypto.timingSafeEqual(bufA, bufB);
    } catch (err) {
        return false;
    }
}

// Secure token validation
function validateToken(userToken, storedToken) {
    if (!userToken || !storedToken) {
        return false;
    }
    return timingSafeEqual(userToken, storedToken);
}

module.exports = {
    timingSafeEqual,
    validateToken
};