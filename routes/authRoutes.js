const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifySignUp = require('../middlewares/verifySignUp');

// Importación de verificación con manejo de errores mejorado
let authJwt;
let verifyToken;

try {
    authJwt = require('../middlewares/authJwt');
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] Middlewares de autenticación importados correctamente');
} catch (error) {
    console.error('[AuthRoutes] ERROR al importar middlewares:', error);
    process.exit(1);
}

// Middleware de diagnóstico mejorado
router.use((req, res, next) => {
    console.log('\n[AuthRoutes] Petición recibida:', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    next();
});

// Ruta de login (sin protección)
router.post('/signin', authController.signin);

// Ruta de registro con middlewares
router.post('/signup',
    (req, res, next) => {
        console.log('[AuthRoutes] Verificando datos de registro');
        next();
    },
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authController.signup
);

// Ruta para creación manual de administradores
router.post('/create-admin',
    verifyToken,          // Requiere autenticación
    authJwt.isAdmin,      // Requiere rol de administrador
    (req, res, next) => {
        console.log('[AuthRoutes] Solicitud de creación de admin recibida');
        next();
    },
    authController.createAdmin
);

// Ruta protegida con autenticación JWT (nueva)
router.get('/ruta-protegida', 
    verifyToken,          // Middleware de autenticación
    (req, res) => {
        res.json({ 
            message: 'Acceso concedido a ruta protegida',
            user: req.user  // Datos del usuario decodificados del token
        });
    }
);

// Verificación final de rutas (versión mejorada)
const registeredRoutes = router.stack
    .filter(layer => layer.route)
    .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).filter(method => layer.route.methods[method])
    }));

console.log('[AuthRoutes] Rutas configuradas:', registeredRoutes);

module.exports = router;