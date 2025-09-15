const express = require("express");
const ContracManagement = require("../../models/Contracto/ContractManagement");
const Contract = require("../../models/Users/Contractor");
const User = require("../../models/Users/User");
const cron = require("node-cron");

// Ver todos los contratos
exports.getAllContract = async (req, res) => {
  console.log("[CONTROLLER CONTRACTMANAGEMENT] Ejcutando getAllContract");
  try {
    const contract = await ContracManagement.find();
    return res.status(200).json({
      success: true,
      data: contract,
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
    const { typeofcontract, startDate, endDate, contractNumber, state, price } =
      req.body;

    if (
      !typeofcontract ||
      !startDate ||
      !endDate ||
      !contractNumber ||
      !price
    ) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // if (new Date(endDate) < new Date(startDate)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "La fecha fin no puede ser mayor a la fecha inicio",
    //   });
    // }

    // Verificar que no exista un contrato con el mismo numero de contrato
    const contractDuplicate = await ContracManagement.findOne({
      contractNumber,
    });

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
      state,
      price,
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
    const { typeofcontract, startDate, endDate, state, price } = req.body;

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
    if (state) {
      // Buscar el usuario  que este ligado a este contrato
      const userContract = await Contract.findOne({
        contract: contractUpdate._id,
      }).populate("user");
      if (!userContract)
        return console.log(
          "Usuario no existe o este contrato no tiene usuarios"
        );
      userContract.user.status = state;
      userContract.user.save();
    }

    if (typeofcontract) contractUpdate.typeofcontract = typeofcontract;
    if (startDate) contractUpdate.startDate = startDate;
    if (endDate) contractUpdate.endDate = endDate;
    if (state) contractUpdate.state = state;
    if (price) contractUpdate.price = price;

    await contractUpdate.save();

    return res.status(200).json({
      success: true,
      message: "Contracto actualizado",
      date: updateContract,
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
    const contract = await ContracManagement.findByIdAndDelete(req.params.id);
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
