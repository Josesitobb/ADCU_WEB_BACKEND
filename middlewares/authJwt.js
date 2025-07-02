const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const { User } = require('../models/User1');

console.log('[AuthJWT] Configuracion cargada', config.secret ? '***' + config.secret.slice(-5) : 'NO CONFIGURADO');

// Definicion del middleware 
const verifyTokenFn = (req, res, next) => {
    console.log('\n[AuthJWT] Middleware ejecutandose para', req.originalUrl);
    try {
        const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
        console.log('[AuthJWT] Token  recibido:', token ? '***' + token.slice(-8) : 'NO PROVISTO');

        if (!token) {
            console.log('[AuthJWT] Error:token no proporcionado');
            return res.status(403).json({
                succes: false,
                message: 'Token no proporcionado'
            });
        }
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        console.log('[AuthJWT] Token valido para', decoded.email);
        next();
    } catch (error) {
        console.error('[AuthJWT] Error:', error.name, '_', error.message);
        return res.status(401).json({
            succes: false,
            message: 'Token invalido ',
            error: error.message
        });
    }
};

const AuthJWT = (req, res, next) => {
    const token = req.headers.autorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: 'Token no proporcinado'
        });
    }

    try {
        const decoded = jwt.verify(token, proccess.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Token invalido'
        });
    }
};

// Validacion antes de exportar 
if (typeof verifyTokenFn !== 'function') {
    console.error('[AuthJWT] ERROR : verifyTokenFn no es una funcion')
    throw new Error('verifyTokenFn debe ser una funcion');
}

console.log('[AuthJWT] Middleawre verifyTokenFn en una funcion', typeof verifyTokenFn);
module.exports = {
    verifyToken: verifyTokenFn
};