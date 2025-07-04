module.exports = {
    SECRET: process.env.JWT_SECRET || 'Tu_clave_secreta',
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || '24h',

    // Configuración de base de datos actualizada
    DB: {
        URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/crudAsadero2',
        // Ya no se necesitan opciones extra aquí con versiones modernas
        OPTIONS: {}
    },

    ROLES: {
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar'
    }
};
