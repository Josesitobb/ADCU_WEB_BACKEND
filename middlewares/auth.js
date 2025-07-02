const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware de autenticación JWT
exports.authenticate = async (req, res, next) => {
    try {
        // Obtener token del header
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Corregido espacio después de 'Bearer'

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de autenticación requerido' // Corregido typo
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Adjuntar usuario al request
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ // Cambiado a 401 para tokens inválidos
            success: false,
            message: 'Token inválido o expirado',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware de autorización por roles
exports.authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para esta acción',
                requiredRoles: roles,
                currentRole: req.user.role
            });
        }
        next();
    };
};

// Middleware específico para administradores
exports.isAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ // Cambiado send por json para consistencia
        success: false,
        message: 'Se requiere rol de administrador',
        error: 'FORBIDDEN'
    });
};