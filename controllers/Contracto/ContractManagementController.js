const express = require("express");
const ContracManagement = require("../../models/Contracto/ContractManagement");
const Contract = require("../../models/Users/Contractor");
const cron = require("node-cron");

// Ver todos los contratos
exports.getAllContract = async (req, res) => {
  console.log("[CONTROLLER CONTRACTMANAGEMENT] Ejcutando getAllUsers");
  try {
    const contract = await ContracManagement.find();
    console.log("[CONTROLLER CONTRACTMANAGEMENT]", contract.length);
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

// Obtener un contrato espesifico
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
exports.creatContract = async (req, res) => {
  try {
    const { typeofcontract, starteDate, endDate, contractNumber, state } =
      req.body;

    if (!typeofcontract || !starteDate || !endDate || !contractNumber) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if (new Date(endDate) < new Date(starteDate)) {
      return res.status(400).json({
        success: false,
        message: "La fecha fin no puede ser mayor a la fecha inicio",
      });
    }

    const contract = new ContracManagement({
      typeofcontract,
      starteDate: new Date(starteDate),
      endDate: new Date(endDate),
      contractNumber,
      state: "Activo" || state,
    });

    const saveContract = await contract.save();

    if (saveContract) {
      return res.status(200).json({
        success: true,
        data: saveContract,
      });
    }

    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Contrato creado ",
      saveContract._id
    );
  } catch (error) {
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Error al crear un contrato ");
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
    const updateContract = await ContracManagement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updateContract) {
      return res.status(404).json({
        success: false,
        message: "Contrato no encontrado",
      });
    }
    // Verificar que el estado, si el estado es Inactivo pasar el usuario ligado al contrato a Inactivo
    // Verificar que cambie el estado del contrato a inactivo
    if (updateContract.state === "Inactivo") {
      // Hacer la consulta del contratista que esta ligado a ese contrato
      const contract = await Contract.findOne({ contract: updateContract._id });
      // Verifica si el contratista existe
      if (contract) {
        // Hacer el cambio
        contract.state = "Inactivo";
        try {
          console.log(
            "[CONTROLLER CONTRACTMANAGEMENT] Contratista actualizado a Inactivo"
          );
          await contract.save();
        } catch {
          console.error(
            "[CONTROLLER CONTRACTMANAGEMENT] Error al cambiar el estado del contratista:",
            error.message
          );
        }
      } else {
        console.warn(
          "[CONTROLLER CONTRACTMANAGEMENT] Contratista no encontrado para actualizar el estado"
        );
      }
    }

    // Verificar que cambie el estado del contrato a activo
    if (updateContract.state === "Activo") {
      const contract = await Contract.findOne({ contract: updateContract._id });
      if (contract) {
        contract.state = "Activo";
        try {
          await contract.save();
          console.log(
            "[CONTROLLER CONTRACTMANAGEMENT] Contratista actualizado a Activo"
          );
        } catch (error) {
          onsole.error(
            "[CONTROLLER CONTRACTMANAGEMENT] Error al cambiar el estado del contratista:",
            error.message
          );
        }
      } else {
        console.warn(
          "[CONTROLLER CONTRACTMANAGEMENT] Contratista no encontrado para actualizar el estado"
        );
      }
    }

    // Verificar la fecha inicio no puede ser mayor a fecha fin
    if (updateContract.endDate < updateContract.starteDate) {
      return res.status(400).json({
        success: false,
        message: "La fecha de fin no puede ser menor a la fecha de inicio",
      });
    }

    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Contrato para actualizar ",
      updateContract._id
    );

    return res.status(200).json({
      success: true,
      message: "Contracto actualizado",
      date: updateContract,
    });
  } catch (error) {
    console.log(
      "[CONTROLLER CONTRACTMANAGEMENT] Error al actualizar un contrato"
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
    console.log("[CONTROLLER CONTRACTMANAGEMENT] Contrato para eliminar  ");

    const contract = await ContracManagement.findByIdAndDelete(req.params.id);

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
