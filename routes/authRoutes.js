const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifySignUp = require('../middlewares/verifySignUp');

// Importación de verificación con manejo de errores mejorado
let verifyToken;

try {
    const authJwt = require('../middlewares/authJwt');
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] verifyToken importado correctamente:', typeof verifyToken);
} catch (error) {
    console.error('[AuthRoutes] ERROR al importar verifyToken:', error);
    process.exit(1); // Detener la aplicación si no se puede cargar este middleware crítico
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

// Verificación final de rutas (versión mejorada)
const registeredRoutes = router.stack
    .filter(layer => layer.route)
    .map(layer => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods).filter(method => layer.route.methods[method])
    }));

console.log('[AuthRoutes] Rutas configuradas:', registeredRoutes);

module.exports = router;