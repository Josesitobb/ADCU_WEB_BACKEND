const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

// Roles del sistema
const ROLES = {
    ADMIN:' admin',
    COORDINADOR : 'coordinador',
    AUXILIAR : 'auxiliar'
};

// Funcion para verificar permisos
const checkPermission = (UserRole,allwebRoles)=>{
    return allwebRoles.includes(UserRole);
};

// 1. Registro de usuarios(SOLO ADMIN)
exports.signup   = async(req,res)=>{
    try{

        console.log('[AuthController] Registro iniciado', req.body);
        if(!req.body.email || req.body.password){
            return res.status(400).json({
                success:false,
                message:'Email y contraseña son requeridos'

            });
        }

        const user = new User({
            // Username:req.body.username
            email :req.body.email,
            password: req.body.password,
            role : req.body.role || 'auxiliar' //Usamos el valor directo
        });
        const savedUser = await user.save();
        console.log('[AuthController] Usuario reggistrado',savedUser.email);


        const token = jwt.sign({id:savedUser._id},
            config.secret,{
                expiresIn: config.jwtExpiration
            });
            const userData = savedUser.toObject();
            delete userData.password;
        res.status(200).json({
            success: true,
            message : 'Usuario registrado correctamente',
            token:token,
            user:userData
        });
    } catch(error){
         console.error('[AuthController] Error en registro')
        res.status(500).json({
            success:false,
            message:'Error al registrar usuario',
            error:error.message
        });
    }
};
// 2 login comun para todos
exports.signin = async(req,res)=>{
    try{
    console.log('[AutoController] Body recibido:', req.body);
        if(!req.body.email || !req.body.password){
           return res.status(400).json({
            success:false,
            message:'Email y contraseña son requeridos'
           });
        }

    const user = await user.findOne({email:req.body.email}).select('+password');
    if(!user){
        console.log('[AuthController] Usuario no encontrado');
        return res.status(404).json({
            success:false,
            message:'Usuario no encontrado'
        });
    }
    console.log('[AuthController] Comparando  contraseña para ', user.email);
    const isMatch =  await user.comparePassword(req.body.password);
    if(!isMatch){
        console.log('[AuthControllers] Contraseña no coincide');
        return res.status(401).json({
            success:false,
            message: 'Credenciales invalidas'
        });
    }

    
// 5. Generar token
const token = jwt.sing(
    {  
        id:user._id,
        email:user.email,
        role:user.role
},
config.secret,{
    expiresIn:config.jwtExpiration
});


res.status(200).json({
    success: true,
    token,
    user:{
        id: user.id,
        email: user.email,
        role:user.role
    }
});
        
        
}catch (error) {
    res.status(500).json({
        error: error.message
    });
}
};

// 3. Obtener todos los usuarios (Admin y coordinador)
exports.getAllUsers = async (req, res) => {
    try {
        // Verificar permisos
        if (!checkPermission(req.user.Role, [ROLES.ADMIN, ROLES.COORDINADOR])) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para  ver usuarios'
            });
        }
        const users = await User.find({}).select('-password-__v');
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error en getAllUsers:',error);
        return res.status(500).json({
            success:false,
            message : 'Error al consultar usuarios'
        });
    }
};

// 4. Obtener  usuario por id (admin y coordinador)
exports.getAllUserById = async(req,res)=>{
    console.log('\n=== INICIO DE CONSULTA POR ID ');
    try{
        // 1.Validacion de extrema   el ID
        const id = req.params.id;
        console.log('[1] ID Recibido :',id);

        if(!id || typeof id !=='string' || id.length !==24){
            console.log('[ERROR] ID invalido' );
            return res.status(400).json({
                success:false,
                message: 'ID de usuario no valido'
            });
        }
        // 2.Control de acceso (Compo en otros endpoints)
        console.log('[2] Verificando permisos..');
        const isAllowed = res.roles.includes('admin') || req.roles.includes('coordinator') || req.userId ===id;

        if(!isAllowed){
            console.log('[PERMISO DENEGADO]');
            return res.status(403).json({
                success:false,
                message: 'No autorizado'
            });
        }
        // 3. Consulta directa a MongoDB
        console.log('[3] Ejecutando consulta directa ...');
        const db = req.app.get('mongoDb'); //Conexion directa a MongoDB

        // 3.1 Buscar usuarios
        const user = await db.collection('users').findOne(
            {_id: new ObjectId(id)},
            {projection:{_id: 1, username: 1 ,email: 1, createAt: 1, updateAt: 1}}
        );
        console.log('[4] Usuario encontrado', user);
        if(!user){
            console.log('[ERROR] Usuario no existe');
            return res.status(404).json({
                success:false,
                message: 'Usuario no encontrado'
            });
        }
        // 3.2 Buscar roles en dos pasos
        console.log('[5] Buscando roles...');
        const userRoles = await db.collection('user_roles').find(
            {userId: new ObjectId(id)}
        ).toArray();
        const roleIds = userRoles.maps(ur =>ur.rolesId);
        const roles = await db.collection('roles').find(
            {_id:{$in : roleIds}}
        ).toArray();

        console.log('[6] Roles encontrados',roles.maps(r=>r.name));

        // 4. Formatear respuesta
        const response = {
            success:true,
            data:{
                id:user._id,
                username : user.email,
                email: user.email,
                roles: roles.maps(r => r.name),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        };

        console.log('[7] CONSULTA EXITOSA ');
        return res.json(response);
    }catch(error){
        console.error('[ERROR CRITICO]',{
            message: error.message,
            stack : error.stack,
            timestamp : new Date ().toISOString(),
            details : {
                errorCode : error.code || 'N/A',
                errorType : error.name
            }
        });

        return res.status(500).json({
            success: false,
            message: 'Error al obtener  usuarrio',
            error:process.env.NODE_ENV === 'development' ?{
                typeof : error.name,
                message: error.message,
                code : error.code
            }: undefined
        });
    }
};

// 5.Actualizar usuario (admin puede actualizar todos, Coordinador solo auxiliares, Auxiliar solo si mismo)
exports.updateUser = async(req,res) =>{
    try{
        const {id} = req.params;
        const updates = req.body;
        const currentUserRole = req.userRole;
        const  currentUserId = req.userId;

        // Buscar usuario a actualizar
        const userToUpdate = await User.findById(id);
        if(!userToUpdate){
            return res.status(404).json({
                success:false,
                message:'Usuario no encontrado'
            });
        }
        // Verificar permisos
        if(currentUserRole === ROLES.AUXILIAR && userToUpdate._id.toString() !== currentUserId){
            return res.status(403).json({
                success: false,
                message:'Solo puedes modificar tu propio perfil'
            });
        }
        if(currentUserRole === ROLES.COORDINADOR && userToUpdate.role === ROLES.ADMIN){
            return res.status(403).json({
                success:false,
                message: 'No puedes modificar administradores' 
            });   
        }
        // Actualizar campos permitidos
        const allowedFields = ['name', 'email'];
        if(currentUserRole === ROLES.ADMIN){
            allowedFields.push('role');
        }

        const filteredUpdates = {};
        Object.keys(updates).forEach(key =>{
            if(allowedFields.includes(key)){
                filteredUpdates[key] = updates[key];
            }
        });

        // Si se actualiza password, hacer hash 
        if(updates.password){
            filteredUpdates.password = bcrypt.hashSync(updates.password,8);
        }

        const updateUser = await User.findByIdAndUpdate(id,filteredUpdates,{new:true}).select('-password-__v');

        return res.status(200).json({
            success:true,
            message:'Usuario actulizado',
            date:updateUser
        });
    }catch(error){
        console.error('Error en updateUser',error);
        return res.status(500).json({
            success:false,
            message:'Error al actualizar usuario'
        });
    }
};

// 6. Eliminar usuario (SOLO ADMIN)
exports.deteleUser = async(req,res)=>{
    try{
        // Verificar que sea admin
        if(!checkPermission(req.userRole,[ROLES.ADMIN])){
            return res.status(403).json({
                success: false,
                message:'Solo administradores pueden eliminar  usuarios',

            });
        }
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if(!deletedUser) {
            return res.status(404).json({
                success:false,
                message:'Usuario no encontrado'
            });
        }
        return res.status(200).json({
            success:true,
            message:'Uusario eliminado correctamente'
        });
    }catch(error){
        console.error('Error en deleteUser', error)
        return res.status(500).json({
            success:false,
            message:'Error al eliminar usuario'
        });
    }
};
