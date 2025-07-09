const checkRole = (...allowedRoles)=>{
    return(req,res,next)=>{
        if(!req.userRole){
            console.log('Intento de verificar rol con token son invalido');
            return res.status(500).json({
                success:false,
                message:'ERRO AL VERIFICAR EL ROL',
            });
        }

        if(!allowedRoles.includes(req.userRole)){
                   console.log(`Aceeso denegado para ${req.userEmail} (${req.userRole}) en ruta ${req.path}`);
                   return res.status(403).json({
                    success:false,
                    mesaage: 'No tienes permisos para esta accion'
                   })
        }
        next();
    }
}


// Funciones especificas por rol
const isAdmin = (req,res,next)=>{
    return checkRole('admin')(req,res,next);
};

const isCoordinador = (req,res,next)=>{
return checkRole('coordinador')(req,res,next);
};

const isAuxiliar =(req,res,next)=>{
    return checkRole('auxiliar')(req,res,next);
};

module.exports={
    checkRole,
    isAdmin,
    isCoordinador,
    isAuxiliar
};