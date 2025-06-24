const User = require('../../models/Users/User');
const bcrypt = require('bcryptjs');
const Contractor = require('../../models/Users/Contractor');
const Functionary = require('../../models/Users/Functionary');

//Obtener todos los usuarios (ADMIN)

exports.getAllUsers = async(req,res)=>{
console.log('[CONTROLLER USER] Ejecutando getAllUsers');

try{
    const users = await User.find().select('-password');
    console.log('[CONTROLLER USER] Los usuario encontrados son',users.length);

    res.status(200).json({
        success:true,
        data:users
    });
}catch(error){
    console.log('[CONTROLLER USER] Error en getAllUsers',error.messagge);
    res.status(500).json({
        success:false,
        messagge:'Error al obtener usuarios'
    });
    }
};

// Obtener usuarios especifico
exports.getUserById= async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).select('-password');

        if(!user){
            return res.status(404).json({
                success:false,
                message:'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success:true,
            data:user
        });
    }catch(error){
        console.log('[CONTROLLER USER] Error en getAllUsers',error.messagge);
        res.status(500).json({
            success:true,
            message:'Error al obtener usuario',
            error:error.message
        });
    }
};

// CREAR EL USUARIO 

exports.createUser = async(req,res)=>{
    try{
        // Constantes para almacenar el valor
        // Validar los datos personales
        const {name,lastname,idcard,telephone,email,password,role, state, contractId, post} = req.body;
        
        if(!name  || !lastname || !idcard || !telephone || !email || !password || !role ||!state || !post){
           return res.status(400).json({
                success:false,
                message:'Todos los campos son obligatorios'
            })
        };

        if(role !=="contratista" && role !=="funcionario" && role !== "admin"){
           return res.status(401).json({
                success:false,
                message:'Rol no existente',

            });
        };

        if (role === "contratista" && !contractId) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar un contrato para el rol contratista'
            });
        }

        // Crear el usuario 
        const user = new User({
            name,
            lastname,
            idcard,
            telephone,
            email,
            password,
            role
        });
       
        const savedUser = await user.save();

        if(savedUser.role =="admin"){
            console.log('[COMTROLLER USER] Usuario creado',savedUser._id);
            return res.status(200).json({
                success:true,
                message:'Usuario creado exitosamente',
                data: {
                    name: savedUser.name,
                    lastname: savedUser.lastname,
                    idcard: savedUser.idcard,
                    telephone: savedUser.telephone,
                    email: savedUser.email,
                     role: savedUser.role,
                    _id: savedUser._id,
                    __v: savedUser.__v
        } 
            });
        };

         // Mesaje para verificar el usuario
        console.log('[CONTROLLER USER] Usuario creado:', savedUser._id);
        

        // Crear el usuario depediendo el rol

        // Funcionarios
        if(role == "funcionario"){
            const functionary = new Functionary({
                post,
                state,
                user: savedUser._id
            });
            // Mesaje para verificar el usuario
            const savedFuncionary = await functionary.save();
            console.log('[CONTROLLER USER] Rol funcionario asignado a usuario:', savedFuncionary._id);

            // Consults completa   
            const fullFunctionary = await Functionary.findById(savedFuncionary._id).populate({path:'user',select:'-password'});
           return res.status(201).json({
                success:true,
                message:'Usuario asigando a el rol funcionario exitosamente',
                data:fullFunctionary
            });
        }

        // Contratista
        else if(role =="contratista"){
            const contractor = new Contractor({
                post,
                state,
                User:savedUser._id,
                Contract:contractId
            })
            console.log('[CONTROLLER USER] Asigando el Rol a el usuario creado',contractor.length);
            // Guarda en la base de datos el usuario contratista
            const saveContractor = await contractor.save();

            return res.status(201).json({
                success:true,
                message:'Usuario asigando a el rol contratista con el contrato exitosamente',
                data:saveContractor
            });
        }
    }catch(error){
        console.log('[CONTROLLLERS USER] Erro la crear un usuario', error.message);
        res.status(500).json({
            success:false,
            message:'Error al crear usuario',
            error:error.message
        });
    };
};


// Actualizar el usuario

exports.updateUser = async(req,res)=>{
    try{
const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {$set:req.body},
    {new:true}

).select('-password');

if(!updatedUser){
    return res.status(404).json({
        success:false,
        message:'Usuario no encontrado'
    });
}

return res.status(200).json({
    success:true,
    message:'Usuario actualizado exitosamente',
    data: updatedUser
});

}
    catch(error){
console.log('[CONTROLLLERS USER] Erro al actualizar el usuario', error.message);

return res.status(500).json({
    success:false,
    message:'Erro al actualizar el usuario',
    error:error.message,
});
    }
};


// Eliminar usuario 

exports.deleteUser = async(req,res)=>{
    try{
    console.log('[CONTROLLER] Ejecutando deleteUser para ID', req.params.id);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    // El Id donde el usuario coincida con funcionario
    const deletedFunctionary = await Functionary.findOneAndDelete({ User: req.params.id });
    if(!deletedUser && !deletedFunctionary){
        console.log('[CONTROLLER USER] Usuario no encontrador para eliminar');
        return res.status(404).json({
            success:false,
            message:'Usuario no encontrado'
        });
    }
    console.log('[CONTROLLER] usuario eliminar',deletedUser._id);

    return res.status(200).json({
        success:true,
        message:'Usuario eliminado correctamente'
    });
}catch(error){
            console.error('[CONTROLLER Error al eliminar usuario]', error.message);//Diagnostico
            return res.status(500).json({
                success:true,
                message:'Error al eliminar el usuario',
                error:error.message
            });
}
};