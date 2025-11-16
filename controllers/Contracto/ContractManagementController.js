const express = require("express");
const ContracManagement = require("../../models/Contracto/ContractManagement");
const Contract = require("../../models/Users/Contractor");
const ContractManagement = require("../../models/Contracto/ContractManagement");

// Ver todos los contratos
exports.getAllContract = async (req, res) => {
  console.log("[CONTROLLER CONTRACTMANAGEMENT] Ejcutando getAllContract");
  try {
    // // QuerySelector
    const { WithContractor } = req.query;

    // Verificar que WithContractor sea booleano
    if (WithContractor && !["true", "false", "/"].includes(WithContractor)) {
      return res.status(400).json({
        success: false,
        message: "Tiene que ser true o false o dejar el espacion en blanco",
      });
    }

    // Variablae global
    let AllContact;
    // Todos los contratos que estann vinculados
    if (WithContractor == "true")
      AllContact = await Contract.find().populate("contract");

    // Los contrato que no estan vinculados
    if (WithContractor == "false") {
      // Consultar todos los contratista
      const userContracts = await Contract.find({}, "contract");

      // Iterrar por cada id
      const newUserContracts = userContracts.map((u) => u.contract);

      // Consulta todos los contratos
      AllContact = await ContracManagement.find({
        _id: { $nin: newUserContracts },
      });
    }

    // Si no viene nada en la url mandar todos los contratos
    if (WithContractor == undefined)
      AllContact = await ContractManagement.find();

    return res.status(200).json({
      success: true,
      data: AllContact,
    });
  } catch (error) {
    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Error en get AllContract",
      error.message
    );
    return res.status(500).json({
      success: false,
      message: "Error al obtener los contratos",
      error: error.message,
    });
  }
};

// Obtener contratos activos e inactivos
exports.getStateContracts = async (req, res) => {
  // Traer estado del la url
  const { state } = req.query;

  // Verificar que el state sea boleano
  if (!["true", "false"].includes(state)) {
    return res.status(400).json({
      success: false,
      message: "El valor tiene que ser true o false",
    });
  }

  // Convertir el valor a bolenano para no mandar directarmente a la consulta
  const stateBool = state === "true";

  // Mandar consulta
  const contracAtive = await ContracManagement.find({ state: stateBool });

  if (!contracAtive) {
    return res.status(404).json({
      success: false,
      message: "No hay contrato activos en este momento",
    });
  }

  return res.status(200).json({
    success: true,
    message: `El numero de contrato activos es ${contracAtive.length}`,
    data: contracAtive.length !== 0 ? contracAtive : "No hay contratos",
  });
};

// Obtener un contrato especifico
exports.getContractById = async (req, res) => {
  try {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Ejecutando  getContractById");
    const contract = await ContracManagement.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "El contrato no existe",
      });
    }

    return res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    console.log("Error en getContractById", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener un contrato",
      error: error.message,
    });
  }
};

// Crear el contrato
exports.createContract = async (req, res) => {
  try {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Contrato para crear ");
    const {
      typeofcontract,
      startDate,
      endDate,
      contractNumber,
      state,
      periodValue,
      totalValue,
      objectiveContract,
      extension,
      addiction,
      suspension,
    } = req.body;

    if (
      !typeofcontract ||
      !startDate ||
      !endDate ||
      !contractNumber ||
      !periodValue ||
      !totalValue ||
      !objectiveContract
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar que no exista un contrato con el mismo numero de contrato
    const contractDuplicate = await ContracManagement.findOne({contractNumber});

    if (contractDuplicate) {
      return res.status(400).json({
        success: false,
        message: "No se puede aver 2 contratos con el mismo numero de contrato",
      });
    }

    const contract = new ContracManagement({
      typeofcontract,
      startDate,
      endDate,
      contractNumber,
      state: state || true,
      periodValue,
      totalValue,
      objectiveContract,
      extension: extension || false,
      addiction: addiction || false,
      suspension: suspension || false,
    });

    const saveContract = await contract.save();
    return res.status(200).json({
      success: true,
      data: saveContract,
    });
  } catch (error) {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Error al crear un contrato");
    return res.status(500).json({
      success: false,
      message: "Error al crear contrato",
      error: error.message,
    });
  }
};

// Actualizar el contrato
exports.updateContract = async (req, res, next) => {
  try {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Contrato para actualizar ");
    // Variables especiales para la actualizacion
    const {
      typeofcontract,
      startDate,
      endDate,
      contractNumber,
      state,
      periodValue,
      totalValue,
      objectiveContract,
      extension,
      addiction,
      suspension,
    } = req.body;

    // Consulta a la base de datos
    const contractUpdate = await ContracManagement.findById(req.params.id);

    // Verificar si el contrato existe
    if (!contractUpdate) {
      return res.status(404).json({
        success: false,
        message: "El contrato no existe",
      });
    }

    // Si el estado del contrato cambia el estado del usuario que este ligado tambien
    if (state !== undefined) {
      // Buscar el usuario  que este ligado a este contrato
      const userContract = await Contract.findOne({
        contract: contractUpdate._id,
      }).populate("user");
      if (userContract) {
        userContract.user.state = state;
        await userContract.user.save();
      }
    }

    // Verificar que no exista un contrato con el mismo numero de contrato
    if (contractNumber && contractNumber !== contractUpdate.contractNumber) {
      const contractDuplicate = await ContracManagement.findOne({
        contractNumber,
      });

      if (contractDuplicate) {
        return res.status(400).json({
          success: false,
          message: "Ya existe un contrato con el mismo numero de contrato",
        });
      }
    }

    if (typeofcontract) contractUpdate.typeofcontract = typeofcontract;
    if (startDate) contractUpdate.startDate = startDate;
    if (endDate) contractUpdate.endDate = endDate;
    if (state !== undefined) contractUpdate.state = state;
    if (objectiveContract) contractUpdate.objectiveContract = objectiveContract;
    if (periodValue) contractUpdate.periodValue = periodValue;
    if (totalValue) contractUpdate.totalValue = totalValue;
    if (extension !== undefined) contractUpdate.extension = extension;
    if (addiction !== undefined) contractUpdate.addiction = addiction;
    if (suspension !== undefined) contractUpdate.suspension = suspension;
    if (contractNumber) contractUpdate.contractNumber = contractNumber;

    await contractUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Contracto actualizado",
      date: contractUpdate,
    });
  } catch (error) {
    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Error al actualizar un contrato",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Erro al actualizar el contrato",
      error: error.message,
    });
  }
};

// Eliminar un contrato
exports.deleteContract = async (req, res) => {
  try {
    const idContract = req.params.id;

    // Verificar que le usuario no pueda elimianar a el contratista si tiene un contrato
    const verifyUser = await Contract.findOne({ contract: idContract });

    if (verifyUser) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar un contrato con un contratista vinculado, cambie el contratista de contrato",
      });
    }

    const contract = await ContracManagement.findByIdAndDelete(idContract);
    //Verificar que un contrato exista
    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contrato no encontrado para eliminar",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Contracto eliminar exitosamente",
    });
  } catch (error) {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Error al eliminar el usuario");
    return res.status(500).json({
      success: false,
      message: "Error al eliminar un contracto",
      error: error.message,
    });
  }
};

// Estadisticas de los contratos
exports.getStatsContract = async (req, res) => {
  try {
    let stats;

    // Traer todos los contratos
    const contractStats = await ContracManagement.find();

    // Contar contratos activos e inactivos
    const activeContracts = contractStats.filter(
      (c) => c.state === true
    ).length;
    const inactiveContracts = contractStats.filter(
      (c) => c.state === false
    ).length;
    const totalContracts = contractStats.length;

    // Contrato vinculados a un contratista
    const contractsLinked = (await Contract.find().populate("contract")).length;

    // Contrato que no esta vinculado a ningun contratista
    const contractsNotLinked = totalContracts - contractsLinked;

    // Contrato que tiene la fecha de finalizacion menor a la fecha actual
    const expiredContracts = contractStats.filter(
      (c) => new Date(c.endDate) < new Date()
    ).length;

    stats = {
      "Total de contratos": totalContracts,
      "Contratos activos": activeContracts,
      "Contratos inactivos": inactiveContracts,
      "Contratos vinculados": contractsLinked,
      "Contratos no vinculados": contractsNotLinked,
      "Contratos expirados": expiredContracts,
    };

    return res.status(200).json({
      success: true,
      message: "Estadisticas de contratos obtenidas exitosamente",
      data: stats,
    });
  } catch (error) {
    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Error al obtener estadisticas"
    );
    return res.status(500).json({
      success: false,
      message: "Error al obtener estadisticas de contratos",
      error: error.message,
    });
  }
};
