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
        state: state === "true",
        role: "admin",
      }).select("-password");

    // Consulta a la base de datos
    if (state == undefined)
      userAllAdmin = await User.find({ role: "admin" }).select("-password");

    return res.status(200).json({
      success: true,
      message: `Usuarios admis encontrados con el estado: ${state} son: ${userAllAdmin.length}`,
      data:
        userAllAdmin.length === 0
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
      const userFuncionary = await Functionary.find().populate({
        path: "user",
        select: "-password ",
      });
      // Filtrar por state
      userAllFuncionary = userFuncionary.filter(
        (u) => u.user.state === (state === "true" )
      );
    }

    // Si no viene state motrar todos los usuarios sin umportar el state
    if (state == undefined)
      userAllFuncionary = await Functionary.find().populate({
        path: "user",
        select: "-password",
      });

    return res.status(200).json({
      success: true,
      message:
        state == undefined
          ? `Usuario funcionario encontrados : ${userAllFuncionary.length}`
          : `Usuarios funcionarios encontrados con el estado: ${state} son: ${userAllFuncionary.length}`,
      data:
        userAllFuncionary.length === 0
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
      const userContractor = await Contractor.find()
        .populate({ path: "user", select: "-password" })
        .populate("contract");
      // Filtrar por state
      userAllContractor = userContractor.filter(
        (u) => u.user.state === (state ==="true")
      );
    }

    // Si no viene state motrar todos los usuarios sin umportar el state
    if (state == undefined)
      userAllContractor = await Contractor.find()
        .populate({ path: "user", select: "-password" })
        .populate("contract");

    return res.status(200).json({
      success: true,
      message:
        state == undefined
          ? `Usuario contratista encontrados : ${userAllContractor.length}`
          : `Usuarios contratista  encontrados con el estado: ${state} son: ${userAllContractor.length}`,
      data:
        userAllContractor.length === 0
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
    let data;
    // Verificar que que rol tomo el usuario
    if (role === "admin") {
      // Crear el objeto para eviar que al funcion reciba mas de 7 parametros
      data = {
      firsName,
      lastname,
      idcard,
      telephone,
      email,
      password,
      state,
      post,
      role

      }
      usercreate = await createAdmin(data);
    }

    if (role === "funcionario") {
      data={
        firsName,
        lastname,
        idcard,
        telephone,
        email,
        password,
        state,
        post,
        role
      }
      usercreate = await createFuncionary(data);
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

      // Objeto para pasarle los parametros
      data={
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

      }

      usercreate = await createContractor(data);
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
      residentialAddress,
      contractId,
      institutionalEmail,
      EconomicaActivityNumber,
    } = req.body;

    // Buscar el usuario por ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que el rol no se modifique
    if (role && role !== user.role) {
      return res.status(400).json({
        success: false,
        message: "No puedes modificar el rol del usuario",
      });
    }

    // Verificar el telefono
    if (telephone) {
      // Verificar que el telefono no este en uso
      const telephoneExist = await User.findOne({ telephone });
      if (telephoneExist && telephoneExist._id !== user._id) {
        return res.status(400).json({
          success: false,
          message: "El telefono ya esta en uso",
        });
      }
    }

    // Verificar el email
    if (email) {
      // Verificar que el email no este en uso
      const emailExist = await User.findOne({ email });
      if (emailExist && emailExist._id !== user._id) {
        return res.status(400).json({
          success: false,
          message: "El email ya esta en uso",
        });
      }
    }

    // Verificar el idcard
    if (idcard) {
      // Verificar que el idcard no este en uso
      const idcardExist = await User.findOne({ idcard });
      if (idcardExist && idcardExist._id !== user._id) {
        return res.status(400).json({
          success: false,
          message: "El idcard ya esta en uso",
        });
      }
    }

    // Campos del contratista

    // Verificar el estado del contratista
    if (state && user.role === "contratista") {
      return res.status(400).json({
        success: false,
        message:
          "Si quieres cambiar el estado del contratista tienes que hacerlo desde el contrato",
      });
    }

    // Verificar direccion residencial
    if (residentialAddress && user.role === "contratista") {
      const contractor = await Contractor.findOne({ user: user._id });
      if (!contractor) {
        return res.status(404).json({
          success: false,
          message: "Contratista no encontrado",
        });
      }
      contractor.residentialAddress = residentialAddress;
      await contractor.save();
    }

    // verificar email institucional
    if (institutionalEmail && user.role === "contratista") {
      const emailExist = await Contractor.findOne({
        email: institutionalEmail,
      });
      if (emailExist && emailExist.user !== user._id) {
        return res.status(400).json({
          success: false,
          message: "El email institucional ya esta en uso",
        });
      }
      const contractor = await Contractor.findOne({ user: user._id });
      contractor.institutionalEmail = institutionalEmail;
      await contractor.save();
    }

    // Verificar numero de actividad economica
    if (EconomicaActivityNumber && user.role === "contratista") {
      const economicaActivityNumber = await Contractor.findOne({
        user: user._id,
      });
      economicaActivityNumber.EconomicaActivityNumber = EconomicaActivityNumber;
      await economicaActivityNumber.save();
    }

    // Actualizar el contrato
    let userContractor;

    if (contractId) {
      // Si no tiene rol admin no puede cambiar el contrato
      if (req.userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "No tienes permisos para cambiar el contrato",
        });
      }
      // Buscar el contrato
      const contract = await ContractManagement.findById(contractId);
      if (!contract) {
        return res.status(404).json({
          success: false,
          message: "Contrato no encontrado",
        });
      }

      // Verificar que el contrato no este asignado a otro contratista
      const contractAssigned = await Contractor.findOne({
        contract: contractId,
      });
      if (contractAssigned) {
        return res.status(400).json({
          success: false,
          message: "El contrato ya esta asignado a otro contratista",
        });
      }

      // Actualizar el contrato del contratista
      const contractor = await Contractor.findOne({ user: user._id });
      if (!contractor) {
        return res.status(404).json({
          success: false,
          message: "No se encontro el contratista para actualizar el contrato",
        });
      }
      contractor.contract = contractId;
      await contractor.save();
    }
    // Actualizar los campos del usuario
    if (firsName) user.firsName = firsName;
    if (lastname) user.lastName = lastname;
    if (idcard) user.idcard = idcard;
    if (telephone) user.telephone = telephone;
    if (email) user.email = email;
    if (post) user.post = post;
    if (password) user.password = password;

    await user.save();

    // Si el usuario es contratista traer los datos actualizados
    if (user.role === "contratista") {
      userContractor = await Contractor.findOne({ user: user._id })
        .populate({ path: "user", select: "-password" })
        .populate("contract");
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente",
      data: userContractor || user,
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

// StatusUser
exports.getUserStats = async (req, res) => {
  try {
    let stats;
    // Contar todos los usuarios
    const users = await User.find();
    // Total de usuarios
    const totalUsers = users.length;

    // Usuarios activos
    const usersActive = users.filter((u) => u.state === true).length;
    // Usuarios inactivos
    const usersInactive = users.filter((u) => u.state === false).length;
    // Contar usuarios por rol
    const admins = users.filter((u) => u.role === "admin").length;
    const functionarys = users.filter((u) => u.role === "funcionario").length;
    const contractors = users.filter((u) => u.role === "contratista").length;

    // Armar el objeto de estadisticas
    stats = {
      'Total de usuarios': totalUsers,
      'Usuarios activos': usersActive,
      'Usuarios inactivos': usersInactive,
      'Admins': admins,
      'Funcionarios': functionarys,
      'Contratistas': contractors,
    };
    return res
      .status(200)
      .json({
        success: true,
        message: "Estadisticas de usuarios",
        data: stats,
      });
  } catch (error) {
    console.error(
      "[CONTROLLER Error al obtener estadisticas de usuario]",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadisticas de usuario",
      error: error.message,
    });
  }
};
