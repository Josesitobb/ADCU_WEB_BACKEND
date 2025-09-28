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

// Obtener solo los usuario Admin por estado
exports.getAllAdmin = async (req, res) => {
  try {
    // Variable global
    let userAllAdmin;

    // QueryDeLaUrl
    const { state } = req.query;

    if (state && !["true", "false"].includes(state)) {
      return res.status(400).json({
        success: false,
        message: "Si vas a utilizar state tiene que ser booleano",
      });
    }

    // Consulta a la base de datos
    if (state)
      userAllAdmin = await User.find({
        state: state == "true" ? true : false,
        role: "admin",
      }).select("-password");

    // Consulta a la base de datos
    if (state == undefined)
      userAllAdmin = await User.find({ role: "admin" }).select("-password");

    return res.status(200).json({
      success: true,
      message: `Usuarios admis encontrados con el estado: ${state} son: ${userAllAdmin.length}`,
      data:
        userAllAdmin.length !== 0
          ? userAllAdmin
          : `No hay usuarios admins con el estado: ${state}`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios admin",
    });
  }
};

// Obtener solo los funcionarios por estado
exports.getAllFuncionary = async (req, res) => {
  try {
    // Variable global
    let userAllFuncionary;

    // QueryDeLaUrl
    const { state } = req.query;

    // Consulta a la base de datos
    if (state) {
      // Consulta a la base de datos
      const userFuncionary = await Functionary.find().populate({ path: "user",select: "-password "});
      // Filtrar por state
      userAllFuncionary = userFuncionary.filter((u) => u.user.state === (state == "true" ? true : false));
    }

    // Si no viene state motrar todo los usuarios sin umportar el state
    if (state == undefined)
      userAllFuncionary = await Functionary.find().populate({path: "user",select: "-password"});

    return res.status(200).json({
      success: true,
      message:
        state == undefined
          ? `Usuario funcionario encontrados : ${userAllFuncionary.length}`
          : `Usuarios funcionarios encontrados con el estado: ${state} son: ${userAllFuncionary.length}`,
      data:
        userAllFuncionary.length !== 0
          ? userAllFuncionary
          : `No existe funcionarios con el estado que selecciono`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios funcionarios",
    });
  }
};

// Obtener solo los Contratistas
exports.getAllContractor = async (req, res) => {
  try {
    // Variable global
    let userAllContractor;
    
    // QueryDeLaUrl
    const { state } = req.query;

    // Consulta a la base de datos
    if (state) {
      // Consulta a la base de datos
      const userContractor = await Contractor.find().populate({ path: "user", select: "-password" }).populate("contract");
      // Filtrar por state
      userAllContractor = userContractor.filter((u) => u.user.state === (state == "true" ? true : false));
    }


    // Si no viene state motrar todo los usuarios sin umportar el state
    if (state == undefined) userAllContractor = await Contractor.find().populate({ path: "user", select: "-password" }).populate("contract");
 

    return res.status(200).json({
      success: true,
      message:
        state == undefined
          ? `Usuario contratista encontrados : ${userAllContractor.length}`
          : `Usuarios contratista  encontrados con el estado: ${state} son: ${userAllContractor.length}`,
      data:
        userAllContractor.length !== 0
          ? userAllContractor
          : `No existe contratista  con el estado que selecciono`,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Erro al traer todos los usuarios contratista ",
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
      //  Datos obligatorios del contratista
      const {
        contractId,
        residentialAddress,
        institutionalEmail,
        EconomicaActivityNumber,
      } = req.body;

      // Verificar que no vengan vacio
      if (
        !contractId ||
        !residentialAddress ||
        !institutionalEmail ||
        !EconomicaActivityNumber
      ) {
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
        residentialAddress,
        institutionalEmail,
        EconomicaActivityNumber
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
    if (state !== undefined && updatedUser.role === "contratista") {
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
    if (state !== undefined) updatedUser.state = state;
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
