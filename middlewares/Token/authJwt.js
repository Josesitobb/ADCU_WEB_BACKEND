const jwt = require('jsonwebtoken');
const config = require('../../config/auth.config');
const User = require('../../models/Users/User');

console.log('[AuthJWT] Configuracion cargada', config.secret ? '***' + config.secret.slice(-5):'NO CONFIGURADO');

// Definicion del middleware

const verifyTokenfn = (req,res,next)=>{
    console.log('\n[AuthJWT] Middleware ejecutandose para', req.originalUrl);
    try{
        const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
        console.log('[AuthJWT] Token  recibido:', token ? '***' + token.slice(-8) : 'NO PROVISTO');

        // Verificar si el token se manda
        if(!token){
            console.log('[AuthJWT] Erro:token no proporcinado')
            return res.status(403).json({
                success:false,
                message:'Token no proporcinado'
            });
        }
        // Verificar que el token venga firmado 
        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }catch(error){
        console.log('[AuthJWT] Error:', error.name, '_', error.message);
        return res.status(500).json({
            success:false,
            message:'Token invalido',
            error:error.message
        });
    }
};

const AuthJWT = (req,res,next)=>{
    const token = req.headers.authorization?.slice(' ')[1];
    if(!token){
        return res.status(401).json({
            success:false,
            message:'Token no proporcionado'
        });
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:'Token invalido'
        })
    }
}


// Verificar si verifyTokenFn es una funcion 
if(typeof verifyTokenfn!=='function'){
    console.error('[AuthJWT] Error : verifyTokenFn no es una funcion')
    throw new Error('verifyTokenFn debe ser una funcion JOSE')
}

console.log('[AuthJWT] Middleawre verifyTokenFn en una funcion', typeof verifyTokenfn);

module.exports = {
    verifyToken:verifyTokenfn
}

