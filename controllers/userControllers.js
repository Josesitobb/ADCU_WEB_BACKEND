const User = require('../models/User1');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios (solo Admin)
exports.getAllUsers = async (req, res) => {
    console.log('[CONTROLLER] Ejecutando getAllUsers');// Diagnostico

    try {
        const users = await User.find().select('-password');
        console.log('[CONTROLLER] Usuarios encontrados:', users.length); //Diagnostico
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('[CONTROLLER] Eror en getAllUser:', error.message);//Diagnostico
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};

// Obtener usuarios especifico
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};

// Crear usuario (Admin  coordinador)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role
        });
        const savedUser = await user.save();
        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                roles: savedUser.role
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};

// Actualizar usuario (Admin y coordinador)
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Uusario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizando correctamente',
            user: updatedUser
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

// eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
    console.log('[CONTROLLER] Ejecutando deleteUser para ID', req.params.id);
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            console.log('[CONTROLLER] Usuario no encontrdo para eliminar'); //Diagnostico 
            return req.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        console.log('[CONTROLLER] Usuario eliminado', deletedUser._id);
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado correctamente '
        });
    } catch (error) {
        console.error('[CONTROLLER Error al eliminar usuario]', error.message);//Diagnostico
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario '
        });
    }
};
