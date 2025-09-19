const express = require("express");
const Contractor = require("../../models/Users/Contractor");
const DataManagements = require("../../models/DataManagements/DataManagements");
const Document_Management = require("../../models/DocumentManagement/DocumentManagement");
const {OneFile} = require("../../services/FunctionDataPython");


exports.getAllDataManagemente = async (req, res) => {
  try {
    const dataMagemente = await DataManagements.find();
    return res.status(200).json({
      success: true,
      data: dataMagemente,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error mostrar todos los datos",
      error: error.message,
    });
  }
};

exports.getDataById = async (req, res) => {
  try {
    const dataManagementeId = await DataManagements.findById(req.params.id);
    if (!dataManagementeId) {
      return res.status(404).json({
        success: false,
        message: "No se encontro el dato",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Datos del dato",
      data: dataManagementeId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener la comparacion",
      error: error.message,
    });
  }
};

exports.CreateData = async (req, res) => {
  try {
    // Buscar la gestion documetal
    const exitingdocumentManagement  = await Document_Management.findById(req.params.management);

    // Si no existe mensaje de respuesta
    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "Error no existe una gestion documental",
      });
    }

    // Busqueda del usuario para traer NOMBRE CEDULA ,NUMERO DE CELULAR, FECHA DEL CONTRATO, VALOR Y NUMERO
    const ContractUser = await Contractor.findById(exitingdocumentManagement.user_contrac).populate('user','firsName lastName idcard telephone email').populate('contract', 'typeofcontract  startDate endDate contractNumber price');
    
    // Si no existe mensaje de respuesta
    if (!ContractUser) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontro un contratista con la gestion documental asociada",
      });
    }

    // Crear un documento en memoria con el id de la gestion documental
    const UserContractAll=ContractUser.toObject();
    // Se agregar el document management al usuario para enviarlo al python
    UserContractAll.documentManagement=exitingdocumentManagement._id
    
    //  Correr el primer archivo python(Prueba one)
    await OneFile("Primer_Archivo", UserContractAll);

    return res.status(200).json({ success: true, message: "Script ejecutado correctamente" });

  } catch (error) {
    console.error("[CreateData] Error al crear una comparacion:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.SavedData = async (req, res) => {
  try {
    // Variable para la comparacion
    // Comparison:Comparacion estado
    // Usercomparasion:Usuario de comparacion
    // Description: Descripcion por si falla
    // IdUserComparasion: Id del usuario comparado
    // IdDocumentManagement: Id de la gestion documental

    const {
      Field,
      Status,
      Usercomparasion,
      Description,
      IdUserComparasion,
      IdDocumentManagement,
    } = req.body;

    console.log(IdDocumentManagement);

    console.log(req.body);
    console.log("Entrado a la verificacion")
    // Verificar que vengas todas antes de hacer la peticion
    // if (
    //   !Field ||
    //   !Status ||
    //   !Usercomparasion ||
    //   !Description ||
    //   !IdUserComparasion ||
    //   !IdDocumentManagement
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Falta datos para terminanar la comparacion",
    //   });
    // }

    console.log("Paso la verificacion");
    // Verificar que el usuario contratista exista en la tabla contratistas
    const UserContractorExisting = await Contractor.findById(IdUserComparasion);

  

    if (!UserContractorExisting) {
      return res.status(400).json({
        success: false,
        message: "Usuario contratista no existe porfa volver a intentar",
      });
    }
    console.log("Paso la verificacion del contratista");

    // Buscar Si el contratita ya tiene un usuario en data por contratista
    let dataManagementContractor = await DataManagements.findOne({
      contractorId: IdUserComparasion,
    });

    if (!dataManagementContractor) {
      // Crear un documento en memoria para despues insertarlo
      dataManagementContractor = new DataManagements({
        contractorId: IdUserComparasion,
      });
    }

    console.log("Paso la verificacion de data");


    dataManagementContractor[Field] = {
      status: Status,
      description: Description,
      usercomparasion: Usercomparasion,
      documentManagement: IdDocumentManagement,
      contractorId: IdUserComparasion,
    };



    const saved = await dataManagementContractor.save();
    console.log("Documento guardado correctamente:", saved);
    return res.status(201).json({
      success: true,
      message: `Campo ${Field} actualizado correctamente`,
      data: saved,
    });

  } catch (error) {
    console.error("[SavedData] Error al guardar documento:", error);
    return res.status(500).json({
      success: false,
      message: "Error al guardar documento",
      error: error.message,
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
