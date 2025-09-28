const express = require("express");
const Contractor = require("../../models/Users/Contractor");
const DataManagements = require("../../models/DataManagements/DataManagements");
const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");
const {
  OneFile,
  TwoFile,
  ThreeFile,
  FourFile,
  FiveFile,
  SixFile,
  SevenFile,
  EightFile,
  NineFile,
} = require("../../services/FunctionDataPython");

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
    const{management} = req.params;
    const existinDataManagement = await DocumentManagement.findById(management);
    if (!existinDataManagement) {
      return res.status(404).json({
        success: false,
        message: "No existe una gestion documental con ese id",
      });
    }
const dataManagementeId = await DataManagements.findOne({
  $or: [
    { "filingLetter.contractorId": existinDataManagement.userContract },
    { "certificateOfCompliance.contractorId": existinDataManagement.userContract },
    { "signedCertificateOfCompliance.contractorId": existinDataManagement.userContract },
    { "activityReport.contractorId": existinDataManagement.userContract },
    { "taxQualityCertificate.contractorId": existinDataManagement.userContract },
    { "socialSecurity.contractorId": existinDataManagement.userContract },
    { "rut.contractorId": existinDataManagement.userContract },
    { "rit.contractorId": existinDataManagement.userContract },
    { "trainings.contractorId": existinDataManagement.userContract },
    { "initiationRecord.contractorId": existinDataManagement.userContract },
    { "accountCertification.contractorId": existinDataManagement.userContract }
  ]
});

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

exports.createData = async (req, res) => {
  try {
    // Buscar la gestion documetal
    const exitingdocumentManagement = await DocumentManagement.findById(
      req.params.management
    );

    // Si no existe mensaje de respuesta
    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "Error no existe una gestion documental",
      });
    }

    // Busqueda del usuario para traer NOMBRE CEDULA ,NUMERO DE CELULAR, FECHA DEL CONTRATO, VALOR Y NUMERO
    const ContractUser = await Contractor.findById(
      exitingdocumentManagement.userContract
    )
      .populate("user", "firsName lastName idcard telephone email")
      .populate(
        "contract",
        "typeofcontract  startDate endDate contractNumber periodValue totalValue objectiveContract extension addiction suspension"
      );

    // Si no existe mensaje de respuesta
    if (!ContractUser) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontro un contratista con la gestion documental asociada",
      });
    }

    // Crear un documento en memoria con el id de la gestion documental
    const UserContractAll = ContractUser.toObject();
    // Se agregar el document management al usuario para enviarlo al python
    UserContractAll.documentManagement = exitingdocumentManagement._id;

    // Correr archivos python

    // Carta de radicacion
    await OneFile("FilingLetter", UserContractAll);

    //Certificado de cumplimiento no firmado
    await TwoFile("CertificateOfCompliance", UserContractAll);

    // // Certificado de cumplimiento firmado
    // await ThreeFile("signedCertificateOfCompliance", UserContractAll);

    // // Informe de actividad
    await FourFile("ActivityReport", UserContractAll);

    // // Certificado de calidad tributaria
    await FiveFile("TaxQuanlityCertificate", UserContractAll);

    // // Rut
    await SixFile("Rut", UserContractAll);

    // // RIT
    await SevenFile("Rit", UserContractAll);

    // // Acta de inicio
    await EightFile("InitiationRecord", UserContractAll);

    // // Certificacion bancaria
    await NineFile("AccountCertification", UserContractAll);

    return res.status(200).json({
      success: true,
      message: "Analisis completo, Verifica los resultados",
    });
  } catch (error) {
    console.error("[CreateData] Error al crear una comparacion:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatedData = async (req, res) => {
  const { management, field } = req.params;
  try {
    const exitingdocumentManagement = await DocumentManagement.findById(management);

    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "No exise una gestion documental con ese id",
      });
    };

    //Datos del contratista
    const ContractUser = await Contractor.findById(
      exitingdocumentManagement.userContract
    )
      .populate("user", "firsName lastName idcard telephone email")
      .populate(
        "contract",
        "typeofcontract  startDate endDate contractNumber periodValue totalValue objectiveContract extension addiction suspension"
      );

    // Si no existe mensaje de respuesta
    if (!ContractUser) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontro un contratista con la gestion documental asociada",
      });
    };

    // Crear un documento en memoria con el id de la gestion documental
    const UserContractAll = ContractUser.toObject();
    // Se agregar el document management al usuario para enviarlo al python
    UserContractAll.documentManagement = exitingdocumentManagement._id;

    
    //Arreglo de todos los nombres de los documentos
    FieldAll = [
      "filingLetter",
      "certificateOfCompliance",
      "signedCertificateOfCompliance",
      "activityReport",
      "taxQualityCertificate",
      "rut",
      "rit",
      "initiationRecord",
      "accountCertification",
    ];

    if (!FieldAll.includes(field)) {
      return res.status(404).json({
        success: false,
        message: "Seleccione un documento valido para poder actualizar",
      });
    }

    // Verificar si quiere editar cada documentos
    if (field == "filingLetter")  await OneFile("FilingLetter", UserContractAll);

    if(field =="certificateOfCompliance") await  TwoFile("FilingLetter", UserContractAll);

    if(field =="signedCertificateOfCompliance") await ThreeFile("FilingLetter", UserContractAll);

    if(field =="activityReport") await FourFile("ActivityReport", UserContractAll);

    if(field =="taxQuanlityCertificate") await FiveFile("TaxQuanlityCertificate", UserContractAll);

    if(field =="rut") await SixFile("Rut", UserContractAll);

    if(field =="rit") await SevenFile("Rit", UserContractAll);

    if(field =="initiationRecord") await EightFile ("InitiationRecord", UserContractAll);

    if(field =="accountCertification")await  NineFile("AccountCertification", UserContractAll);

    return res.status(200).json({
      success:true,
      message:`Archivo ${field} Actualizado correctamente verifica  `
    })
   
     
                                          
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la comparacion",
      error: error.message,
    });
  }
};

exports.savedData = async (req, res) => {
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


    console.log(req.body);
    console.log("Entrado a la verificacion");
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

exports.deleteData = async (req, res) => {
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

exports.toogleStateData = async(req,res)=>{
  try{

  const {management,field} = req.params;

  const existinDocumentManagement = await DocumentManagement.findById(management);

  if(!existinDocumentManagement){
    return res.status(404).json({
      success:false,
      message:'No existe una gestion documental'
    });
  }

  // Verificar que venga el documento correctos
    FieldSelect =[
      "filingLetter",
      "certificateOfCompliance",
      // "signedCertificateOfCompliance",
      "activityReport",
      "taxQualityCertificate",
      "rut",
      "rit",
      "initiationRecord",
      "accountCertification",
    ];

    if (!FieldSelect.includes(field)) {
      return res.status(404).json({
        success: false,
        message: "Seleccione un documento valido para poder actualizar patch",
      });
    }

    // Validar que si exista una gestion documental con una gestion de datos
    const existinDataManagement = await DataManagements.findOne({documentManagement:existinDocumentManagement.documentManagement});
  

    if(!existinDataManagement){
      return res.status(404).json({
        success:false,
        message:'No hay una gestion de datos asociada a esta gestion documental'
      })
    }

    existinDataManagement[field].status = !existinDataManagement[field].status;
    existinDataManagement[field].description ="ok"

    await existinDataManagement.save();

    return res.status(200).json({
      success: true,
      message: `Estado de ${field} actualizado a ${existinDataManagement[field].status}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
}

exports.getDataStats = async (req, res) => {
  try {
    let stats = {};
    // Total de documentos
    const totalDocuments = await DataManagements.find();
    // Conteo total de documentos
    const totalCount = totalDocuments.length;
    // Contratista sin gestion documental
    // consulta todos los contratistas
    const contractors = await Contractor.find();
    const contractorsWithDocs = contractors.length - totalCount;  
    // Contratos sin gestion documental
    const ContractsWithoutDocumentManagement = contractors.length - totalCount;
    stats = {
      'total de documentos':totalCount,
      'Usuario contratista sin gestion de datos': contractorsWithDocs
    };
    return res.status(200).json({ success: true, message: "Estadísticas de gestión de datos obtenidas correctamente", data: stats });
  } catch (error) {
    console.error("[GetDocumentManagementStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas de gestión de datos",
      error: error.message,
    });
  }
};