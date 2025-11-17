const express = require('express');
const router = express.Router();
const {signin} = require('../../controllers/Login/authController');
const authJwt = require('../../middlewares/Token/authJwt');

let verifyToken;
try{
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] verifyToken importando correctamente:',typeof verifyToken);
}catch(error){
    console.log('[AuthRoutes] Erros al importar verifytoken', error);
    throw error;
}


// Ruta de inicio de sesion
router.post('/signin',
    signin
);



module.exports = router;
