require('dotenv').config();

module.exports = {
    secret : process.env.AUTH_SECRET || "tusecretoparalostokens",
    jwtExpiration:process.env.JWT_EXPIRATION || 86400, 
    saltRounds :process.env.SALT_ROUNDS || 8
};