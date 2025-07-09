const express = require("express");
const DataManagements = require("../../models/DataManagements/DataManagements");
const Document_Management = require("../../models/DocumentManagement/DocumentManagement")
const path = require("path");
const { exec } = require("child_process");

exports.getData = async (req, res) => {
  try {
    const GetData = await DataManagements.find().sort({
      fecha_comparacion: -1,
    });
    return res.status(200).json({
      success: true,
      message: "Todos los Datos",
      data: GetData,
    });
  } catch (error) {
    console.log("[DataManagementControllers] Error en el Controlador ", error);
    return res.status(500).json({
      success: false,
      message: "Error mostrar todos los datos",
      error: error.message,
    });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const Data_managementById = await DataManagements.findById(req.params.id);
    if (!Data_managementById) {
      return res.status(404).json({
        success: false,
        message: "No se encontro el dato",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Datos del dato",
      data: Data_managementById,
    });
  } catch (error) {
    console.log("[DataManagementControllers] Error al obtener una comparacion");
    return res.status(500).json({
      success: false,
      message: "Error al obtener la comparacion",
      error: error.message,
    });
  }
};

exports.CreateData = async (req, res) => {
  try {
     const document_management = req.body.document_management;

     if (!document_management) {
       return res.status(400).json({ message: "Faltan datos: ID o carpeta" });
     }
     
     const DocumentosExistente = await Document_Management.findOne({_id:document_management});
     console.log("📄 Documento encontrado:", DocumentosExistente);

     if(!DocumentosExistente){
      return res.status(404).json({
        success:false,
        message:'Error no existe una gestion documental'
      });
     }

     const carpeta = DocumentosExistente.user_create;
     

    // console.log(req.body);
    // console.log(" Ejecutando script con:", document_management, carpeta);


    // Ruta del python entra a la carpeta
    const scriptPath = path.resolve(__dirname, '../../Files/verificar_campos.py');

    // Ejecuta el comando
const campodepython = "C:/Users/JoseD/AppData/Local/Programs/Python/Python313/python.exe" 
    const comando = `"${campodepython}" "${scriptPath}" "${document_management}" "${carpeta}"`;
    console.log("[Python EXEC]:", comando);
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Python ERROR]:`, error);
        return res
          .status(500)
          .json({ message: "Error ejecutando script Python" });
      }

      if (stderr) {
        console.warn(` STDERR: ${stderr}`);
      }

      console.log(`✅ STDOUT:\n${stdout}`);
      return res.status(201).json({
        message: "Script ejecutado correctamente",
        output: stdout,
      });
    });
  } catch (error) {
    console.log(
      "[DataMangementControllers] Erro al crear una comparacion",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al crear una comparacion",
      error: error.message,
    });
  }
};


exports.SavedData = async (req, res) => {
  try {
    const newData = new DataManagements(req.body);
    const saved = await newData.save();
    return res.status(201).json({
      success: true,
      message: "Documento guardado correctamente",
      data: saved
    });
  } catch (error) {
    console.error("[SavedData] Error al guardar documento:", error);
    return res.status(500).json({
      success: false,
      message: "Error al guardar documento",
      error: error.message
    });
  }
};



exports.DeleteData = async (req, res) => {
  try {
    const newDelete = await DataManagements.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Eliminado con exito",
      data: newDelete,
    });
  } catch (error) {
    console.log(
      "[DataMangementControllers] Erro al borrar un comparacion",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al crear una comparacion",
      error: error.message,
    });
  }
};

