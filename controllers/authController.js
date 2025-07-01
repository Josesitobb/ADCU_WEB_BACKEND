const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const  ObjectId  = require('mongodb');

// Roles del sistema
const ROLES = {
    ADMIN: 'admin',
    COORDINADOR: 'coordinador',
    AUXILIAR: 'auxiliar'
};

// Función para verificar permisos
const checkPermission = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};

// 1. Registro de usuarios (SOLO ADMIN)
exports.signup = async (req, res) => {
    try {
        console.log('[AuthController] Registro iniciado', req.body);
        
        if(!req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Hashear la contraseña
        const hashedPassword = bcrypt.hashSync(req.body.password, 8);

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || ROLES.AUXILIAR
        });

        const savedUser = await user.save();
        console.log('[AuthController] Usuario registrado', savedUser.email);

        const token = jwt.sign({ id: savedUser._id }, config.secret, {
            expiresIn: config.jwtExpiration
        });

        const userData = savedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token: token,
            user: userData
        });
    } catch(error) {
        console.error('[AuthController] Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// 2. Login común para todos
exports.signin = async (req, res) => {
    try {
        console.log('[AuthController] Body recibido:', req.body);
        
        if(!req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const user = await User.findOne({ email: req.body.email }).select('+password');
        
        if(!user) {
            console.log('[AuthController] Usuario no encontrado');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('[AuthController] Comparando contraseña para', user.email);
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        
        if(!isMatch) {
            console.log('[AuthController] Contraseña no coincide');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = jwt.sign(
            {  
                id: user._id,
                email: user.email,
                role: user.role
            },
            config.secret,
            {
                expiresIn: config.jwtExpiration
            }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
        
    } catch(error) {
        console.error('[AuthController] Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

// 3. Obtener todos los usuarios (Admin y coordinador)
exports.getAllUsers = async (req, res) => {
    try {
        // Verificar permisos
        if(!checkPermission(req.user.role, [ROLES.ADMIN, ROLES.COORDINADOR])) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver usuarios'
            });
        }

        const users = await User.find({}).select('-password -__v');
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch(error) {
        console.error('Error en getAllUsers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al consultar usuarios'
        });
    }
};

// 4. Obtener usuario por id (admin y coordinador)
exports.getUserById = async (req, res) => {
    console.log('\n=== INICIO DE CONSULTA POR ID ===');
    try {
        // 1. Validación del ID
        const id = req.params.id;
        console.log('[1] ID Recibido:', id);

        if(!id || typeof id !== 'string' || id.length !== 24) {
            console.log('[ERROR] ID inválido');
            return res.status(400).json({
                success: false,
                message: 'ID de usuario no válido'
            });
        }

        // 2. Control de acceso
        console.log('[2] Verificando permisos...');
        const isAllowed = req.user.role === ROLES.ADMIN || 
                         req.user.role === ROLES.COORDINADOR || 
                         req.user.id === id;

        if(!isAllowed) {
            console.log('[PERMISO DENEGADO]');
            return res.status(403).json({
                success: false,
                message: 'No autorizado'
            });
        }

        // 3. Consulta a MongoDB
        const user = await User.findById(id).select('-password -__v');
        
        if(!user) {
            console.log('[ERROR] Usuario no existe');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('[3] Usuario encontrado:', user.email);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch(error) {
        console.error('[ERROR CRITICO]', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: process.env.NODE_ENV === 'development' ? {
                type: error.name,
                message: error.message
            } : undefined
        });
    }
};

// 5. Actualizar usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const currentUserRole = req.user.role;
        const currentUserId = req.user.id;

        // Buscar usuario a actualizar
        const userToUpdate = await User.findById(id);
        if(!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar permisos
        if(currentUserRole === ROLES.AUXILIAR && userToUpdate._id.toString() !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes modificar tu propio perfil'
            });
        }

        if(currentUserRole === ROLES.COORDINADOR && userToUpdate.role === ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'No puedes modificar administradores' 
            });   
        }

        // Actualizar campos permitidos
        const allowedFields = ['name', 'email'];
        if(currentUserRole === ROLES.ADMIN) {
            allowedFields.push('role');
        }

        const filteredUpdates = {};
        Object.keys(updates).forEach(key => {
            if(allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        // Si se actualiza password, hacer hash
        if(updates.password) {
            filteredUpdates.password = bcrypt.hashSync(updates.password, 8);
        }

        const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, { new: true }).select('-password -__v');

        return res.status(200).json({
            success: true,
            message: 'Usuario actualizado',
            data: updatedUser
        });
    } catch(error) {
        console.error('Error en updateUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

// 6. Eliminar usuario (SOLO ADMIN)
exports.deleteUser = async (req, res) => {
    try {
        // Verificar que sea admin
        if(!checkPermission(req.user.role, [ROLES.ADMIN])) {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden eliminar usuarios'
            });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if(!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });
    } catch(error) {
        console.error('Error en deleteUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
};