const authJwt = require('./authJwt');
const verifySignUp = require('./verifySignUp');
const role = require('./role');

module.exports = {  // Corregido "module.export" a "module.exports"
    authJwt,
    verifySignUp,
    role
};