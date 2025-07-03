module.exports = {
    SECRET: process.env.JWT_SECRET || 'Tu_clave_secreta',
    TOKEN_EXPIRATION: process.env.TOKEN_EXPIRATION || '24h',

    // 2.Configuracion de base de datos
    DB: {
        URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/crudAsadero2',
        OPTIONS: {
            useNewUrlParser: true,  
            useUnifiedTopology: true  
        }
    },
    // 3.Roles del sistema (deben coincidir con tu implementacion)
    ROLES: {
        ADMIN: 'admin',
        COORDINADOR: 'coordinador',
        AUXILIAR: 'auxiliar'
    }
};