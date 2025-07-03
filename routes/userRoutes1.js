const express = require('express');
const  router = express.Router();
const userController = require('../controllers/userControllers');
const {verifyToken} = require('../middlewares/authJwt');
const {checkRole} = require('../middlewares/role');

// Middleware de disgnostico para todlas las rutas

router.use((req,res,next) =>{
    console.log('\n===DIAGNOSTICO DE RUTA ===');
    console.log(`[${new Date().toISOString()}] ${req.method}${req.originalUrl}`);
    console.log('Headers:',{
        'Autorizacion': req.headers.authorization ? '***' + req.headers.authorization.slice(8):null,
        'x-access-token':req.headers['x-access-token']?'***'+req.headers['x-access-token'].slice(-8):null,
        'user-agent':req.headers['user-agent']
    });
    next();
})

// GET/api/users -Lista usuarios (admin,coodinador puede ver todos, auxiliar solo se ve a si mismo)
router.get('/',
    checkRole('admin','coordinador','auxiliar'),
    userController.getAllUsers
);


// POST /api/users/ crear usuario solo admin
router.post('/',
    verifyToken,
    checkRole('admin'),
    userController.createUser
);

// GET /api/users/:id -Obtener usuario especifico (admin y coordinador pueden ver cualquiera, axuiliar solo se ve a si mismo)
router.get('/:id',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userController.getUserById
);


// PUT /api/users/:id - Actualizar usuario (admin y coordinador pueden actualizar)
router.put('/:id',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userController.updateUser
);

// DELETE / api/users/
router.delete('/:id',
    verifyToken,
     checkRole('admin'),
     userController.deleteUser
);

module.exports = router;