// VERIFICAR USUARIO REPETIDOS Y SI EL ROL EXISTE
const {json} = require('express/lib/response');
const User = require('../../models/Users/User');
const checkDuplicateUsernameOrEmail = async(req,res,next)=>{
    try{
        const user = await User.findOne({
            $or:[
                {username:req.body.username},
                {email:req.body.email}
            ]
        }).exec();

        if(user){
            return res.status(400).json({
                success:false,
                message:'Erro Usuario o email ya existe'
            })
        }
        next();
    }catch(error){
        console.log('[verifysignUp] Error en checkDuplicateUsernameOrEmail');
        return res.status(500).json({
            success:false,
            message:'Error en verificar crendeciales',
            error:error.message
        });
    };
}


const checkRolesExisted = (req,res,next)=>{
       try{
        if(req.body.role){
            const validaRoles =['admin','contratista','funcionario'];
            if(!validaRoles.includes(req.body.role)){
                return res.status(400).json({
                    success:false,
                    message:`Rol no valido:${req.body.role}`
                })
            }
        }
        next();
       }catch(error){
        console.log('[verifysignUp] Error en checkRolesExisted');
        return res.status(500).json({
            success:false,
            message:'Erro en verificar el rol',
            error:error.message
        })
       }
}


module.exports = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
}