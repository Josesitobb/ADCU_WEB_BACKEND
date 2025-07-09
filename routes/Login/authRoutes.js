const express = require('express');
const router = express.Router();
const {signin} = require('../../controllers/Login/authController');
const {checkDuplicateUsernameOrEmail, checkRolesExisted} = require('../../middlewares/Login/verifySignUp');


let verifyToken;

try{
    const authJwt = require('../../middlewares/Token/authJwt');
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] verifyToken importando correctamente:',typeof verifyToken);
}catch(error){
    console.log('[AuthRoutes] Erros al importar verifytoken', error);
    throw error;
}

// Middleware de  diagnostico
router.use((req,res,next)=>{
console.log('\n[AuthRoutes] Peticion recibida:',{
    method:req.method,
    path:req.path,
    Headers:{
        authorization:req.headers.authorization ? '***':'NO',
        'x-access-token':req.headers['x-access-token']?'***':'NO'
    }
});
next();
});


// Ruta de inicio de sesion
router.post('/signin',
    signin
);

// // Verificar duplicado y si el rol exisite
// 

module.exports = router;
