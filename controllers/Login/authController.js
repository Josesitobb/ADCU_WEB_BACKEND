const User = require('../../models/Users/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/auth.config');

const ROLES = {
    ADMIN:'admin',
    FUNCIONARIO:'funcionario',
    CONTRATISTA:'contratista'
};
// Inicio de sesion
exports.signin = async(req,res)=>{
    try{
        const {email , password} = req.body;
        
        // Validacion de campos
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:'Email y contraseña son requeridos'
            });
        }

        // Buscar el usuario y  la contraseña
        const user = await User.findOne({email}).select('+password');
        // Si el usuario no existe lansa mensaje de error
        if(!user){
            return res.status(404).json({
                success:false,
                message:'Usuario no encontrado'
            });
        }

        console.log('[AuthController] Usuario encontrado',email);
        // Comparar contraseña

        const isMatch = await user.VerifyPassword(password);
        
        // Si la contraseña no conicide manda eun error

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:'Credenciales invalidas'
            })
        }

        // Generar token JWT
            const token = jwt.sign(
            {id:user._id, role:user.role},config.secret,
            {expiresIn: config.jwtExpiration}
        );

        // Prepar la respuesta sin el dato sensible (Contraseña)
        const userData = user.toObject();
        delete userData.password;

        return res.status(200).json({
            success:true,
            message:'Autenticacion exitosa',
            token,
            user:userData
        });
        
    }catch(error){
        console.log('[AuthController] Error en el login', error);
        return res.status(500).json({
            success:false,
            message:'Error en el servidor',
            error:error.message
        });
    }
}