// 1. Importación CORRECTA del modelo User (asegúrate que la ruta sea exacta)
const User = require('../models/User1');

// 2. Importación de dependencias
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// 3. Importación de configuración (verifica que auth.config.js exista)
const config = require('../config/auth.config');

// 4. Definición de roles
const ROLES = {
    ADMIN: 'admin',
    COORDINADOR: 'coordinador',
    AUXILIAR: 'auxiliar'
};

// 5. Función para verificar permisos (completada)
const checkPermission = (userRole, allowedRoles) => {
    return allowedRoles.includes(userRole);
};

// Creación manual de administrador
exports.createAdmin = async (req, res) => {
    try {
        // Verificar si ya existe un admin (opcional)
        const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false,
                message: 'Ya existe un administrador en el sistema' 
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const adminUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            role: ROLES.ADMIN
        });

        await adminUser.save();
        res.status(201).json({ 
            success: true,
            message: 'Admin creado exitosamente',
            userId: adminUser._id 
        });
    } catch (error) {
        console.error('[AuthController] Error al crear admin:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al crear administrador',
            error: error.message 
        });
    }
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

        // Verificar permisos para crear roles distintos
        if(req.body.role === ROLES.ADMIN && !checkPermission(req.user?.role, [ROLES.ADMIN])) {
            return res.status(403).json({
                success: false,
                message: 'Solo administradores pueden crear otros administradores'
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

// ... (resto del código original se mantiene igual)
// [Aquí irían todas las demás funciones exports que ya tenías: signin, getAllUsers, etc.]