require('dotenv').config();

module.exports = {
    secret : process.env.JWT_SECRET || "AxOp1Yuero91202kdh12",
    jwtExpiration:process.env.JWT_EXPIRATION || 86400, 
    saltRounds :process.env.SALT_ROUNDS || 8
};