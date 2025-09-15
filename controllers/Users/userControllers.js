const User = require("../../models/Users/User");
const bcrypt = require("bcryptjs");
const Contractor = require("../../models/Users/Contractor");
const Functionary = require("../../models/Users/Functionary");
const {
  createAdmin,
  createFuncionary,
  createContractor,
} = require("./userRole");
const ContractManagement = require("../../models/Contracto/ContractManagement");

//Obtener todos los usuarios (ADMIN)
exports.getAllUsers = async (req, res) => {
  console.log("[CONTROLLER USER] Ejecutando getAllUsers");
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.log("[CONTROLLER USER] Error en getAllUsers", err.message);
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: err.message,
    });
  }
};

// Obtener solo los usuario Admin
exports.getAllAdmin = async (req, res) => {
  try {
    // Consulta a la base de datos
    const AdminUser = await User.find().select("-password");
    // Verificar si existe el usuario
    if (!AdminUser) {
      return res.status(404).json({
        success: false,
        message: "No existe el usuario admin",
      });
    }
    // Filtrar los usuarios
    const AdminFilter = await AdminUser.filter(
      (useradmin) => useradmin.role === "admin"
    );
    return res.status(200).json({
      success: true,
      data: AdminFilter,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios admin",
    });
  }
};

// Obtener solo los funcionarios
exports.getAllFuncionary = async (req, res) => {
  try {
    // Consulta a la base de datos
    const FuncionaryUser = await Functionary.find().populate({
      path: "user",
      select: "-password",
    });
    // Verificar si existe el usuario
    if (!FuncionaryUser) {
      return res.status(404).json({
        success: false,
        message: "No existe el usuario admin",
      });
    }
    return res.status(200).json({
      success: true,
      data: FuncionaryUser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios funcionarios",
    });
  }
};

// Obtener solo los funcionarios
exports.getAllContractor = async (req, res) => {
  try {
    // Consulta a la base de datos
    const Contractorser = await Contractor.find()
      .populate({ path: "user", select: "-password" })
      .populate("contract");
    // Verificar si existe el usuario
    if (!Contractorser) {
      return res.status(404).json({
        success: false,
        message: "No existe el usuario admin",
      });
    }
    return res.status(200).json({
      success: true,
      data: Contractorser,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios funcionarios",
    });
  }
};

// Obtener usuarios especifico
exports.getUserById = async (req, res) => {
  try {
    let dateUser;
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (user.role === "admin") {
      dateUser = user;
    }

    if (user.role === "funcionario") {
      dateUser = await Functionary.findOne({ user: user._id }).populate("user");
    }

    if (user.role === "contratista") {
      dateUser = await Contractor.findOne({ user: user._id })
        .populate("user")
        .populate("contract");
    }

    return res.status(200).json({
      success: true,
      date: dateUser,
    });
  } catch (error) {
    console.log("[CONTROLLER USER] Error en getAllUsers", error.messagge);
    res.status(500).json({
      success: true,
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
};

// CREAR EL USUARIO
exports.createUser = async (req, res) => {
  try {
    // Validar los datos personales
    const {
      firsName,
      lastname,
      idcard,
      telephone,
      email,
      password,
      role,
      state,
      post,
    } = req.body;

    // Campos principales
    if (
      !firsName ||
      !lastname ||
      !idcard ||
      !telephone ||
      !email ||
      !password ||
      !role ||
      !state ||
      !post
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if (password.length < 8 || password.length > 20) {
      return res.status(400).json({
        success: false,
        message:
          "La contraseña tiene que ser mayor a 8 caracteres y menor a 20",
      });
    }

    // VALIDAR QUE VENDA EL ROL
    const validateRoles = ["admin", "funcionario", "contratista"];
    if (!validateRoles.includes(role)) {
      return res.status(401).json({
        success: false,
        message: "Rol no existente",
      });
    }

    let usercreate;
    // Verificar que que rol tomo el usuario
    if (role === "admin") {
      usercreate = await createAdmin(
        firsName,
        lastname,
        idcard,
        telephone,
        email,
        password,
        state,
        post,
        role
      );
    }

    if (role === "funcionario") {
      usercreate = await createFuncionary(
        firsName,
        lastname,
        idcard,
        telephone,
        email,
        password,
        state,
        post,
        role
      );
    }

    if (role === "contratista") {
      // Id del contrato verificar si existe
      const { contractId, residentialaddress } = req.body;

      // Verificar que no vengan vacio
      if (!contractId || !residentialaddress) {
        return res.status(400).json({
          success: false,
          message: "Falta datos para crear el usuario contratista",
        });
      }
      // Verificar que el contrato exista
      const verifyContract = await ContractManagement.findById(contractId);
      
      if (!verifyContract) {
        return res.status(400).json({
          success: false,
          message: "El contrato no existe",
        });
      }
      // Verificar que el contrato solo tenga 1 solo contratista
      const verifyUserContract = await Contractor.findOne({
        contract: contractId,
      });

      if (verifyUserContract) {
        return res.status(400).json({
          success: false,
          message: "Este contrato ya esta ligado porfa seleccione otro",
        });
      }

      //Pasar el estado del contrato a el contratista
      const stateContract = verifyContract.state;

      usercreate = await createContractor(
        firsName,
        lastname,
        idcard,
        telephone,
        email,
        password,
        stateContract,
        post,
        role,
        contractId,
        residentialaddress,
      );
      
    }

     res.status(200).json({
      success: true,
      message: "Usuario creado",
      data: usercreate,
    });
  } catch (err) {
    console.error("=== ERROR CONTROLADO EN createUser ===", err);
    return res.status(500).json({
      success: false,
      message: "Error al crear usuario",
      error: err.message,
    });
  }
};

// Actualizar el usuario
exports.updateUser = async (req, res) => {
  try {
    // Variable especiales
    const {
      firsName,
      lastname,
      idcard,
      telephone,
      email,
      password,
      role,
      state,
      post,
      residentialaddress,
    } = req.body;

    const updatedUser = await User.findById(req.params.id);

    //  Si no existe el usuario mandar mensaje
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Rol no se puede editar
    if (role) {
      return res.status(400).json({
        success: false,
        message: "El rol no se puede editar",
      });
    }

    // Verificar el idcard
    if (idcard && idcard !== updatedUser.idcard) {
      const exitingIdcard = await User.findOne({ idcard });
      if (exitingIdcard) {
        return res.status(400).json({
          success: false,
          message: "La cedula ya esta en uso ",
        });
      }
    }

    // Verificar el email
    if (email && email !== updatedUser.email) {
      const exitingEmail = await User.findOne({ email });
      if (exitingEmail) {
        return res.status(400).json({
          success: false,
          message: "El email ya esta en uso porfa seleccione otro",
        });
      }
    }

    // Verificar el numero
    if (telephone && telephone !== updatedUser.telephone) {
      const exitingTelephone = await User.findOne({ telephone });
      if (exitingTelephone) {
        return res.status(400).json({
          success: false,
          message: "El numero ya esta en uso porfa seleccione otro",
        });
      }
    }

    // No permitir editar el state del contratista
    if (state !==undefined && updatedUser.role ==="contratista") {
      return res.status(400).json({
        success: false,
        message: "No se puede actualizar el estado del contratista",
      });
    }

    // Cambio de direccion del contratista
    let contractorUserAddress;
    // Verificar que venga del body la variable
    if (residentialaddress) {
      if (updatedUser.role !== "contratista") {
        return res.status(400).json({
          success: false,
          message: "Solo los contratista tiene direccion",
        });
      }

      const Contractor = await Contractor.findOne({
        user: updatedUser._id,
      });
      // Si no encuentra el contratista da error
      if (!Contractor) {
        return res.status(404).json({
          success: false,
          message: "Erro al actualizar la direccion",
        });
      }

      Contractor.residentialaddress = residentialaddress;
      await Contractor.save();
      contractorUserAddress = await Contractor.populate({
        path: "user",
        select: "-password",
      });
    }

    // Guardar cambios en la base de datos
    if (firsName) updatedUser.firsName = firsName;
    if (lastname) updatedUser.lastName = lastname;
    if (idcard) updatedUser.idcard = idcard;
    if (telephone) updatedUser.telephone = telephone;
    if (email) updatedUser.email = email;
    if (password) updatedUser.password = password;
    if (state !==undefined) updatedUser.state = state;
    if (post) updatedUser.post = post;

    await updatedUser.save();

    const userData = updatedUser.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: contractorUserAddress || userData,
    });
  } catch (error) {
    // Manejar errores
    if (error.code === 11000) {
      const campo = Object.keys(error.keyValue);
      const valor = error.keyValue[campo];
      return res.status(400).json({
        success: false,
        message: `Ya existe un ${campo} con : ${valor} `,
      });
    }

    console.log("[CONTROLLLERS USER] Erro al actualizar el usuario", error);

    return res.status(500).json({
      success: false,
      message: "Erro al actualizar el usuario",
      error: error.message,
    });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    // Borrar Admin
    console.log("[CONTROLLER] Ejecutando deleteUser para ID", req.params.id);
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    // Verifica si existe el usuario
    if (!deletedUser) {
      console.log("[CONTROLLER USER] Usuario no encontrador para eliminar");
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    let idUserDelete;

    // Admin
    if (deletedUser.role === "admin") idUserDelete = deletedUser._id;

    // Contratista
    if (deletedUser.role === "contratista") {
      const deletedContract = await Contractor.findOneAndDelete({
        user: deletedUser._id,
      });
      // Verificar que exista el contratista al que borrar
      if (!deletedContract) {
        return res.status(404).json({
          success: false,
          message: "No se encontro el contratista para borrarlo",
        });
      }
      idUserDelete = deletedContract._id;
    }

    // Funcionarios
    if (deletedUser.role === "funcionario") {
      const deletedFuncionary = await Functionary.findOneAndDelete({
        user: deletedUser._id,
      });
      // Verificar que exista el funcionario al que borrar
      if (!deletedFuncionary) {
        return res.status(404).json({
          success: false,
          message: "No se encontro el contratista para borrarlo",
        });
      }
      idUserDelete = deletedFuncionary._id;
    }

    return res.status(200).json({
      success: true,
      message: `Usuario con id ${idUserDelete} eliminado correctamente`,
    });
  } catch (error) {
    console.error("[CONTROLLER Error al eliminar usuario]", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el usuario",
      error: error.message,
    });
  }
};
