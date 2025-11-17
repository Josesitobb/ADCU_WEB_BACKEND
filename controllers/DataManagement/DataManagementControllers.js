const fs = require("node:fs");
const path = require("node:path");
const Contractor = require("../../models/Users/Contractor");
const DataManagements = require("../../models/DataManagements/DataManagements");
const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");
const mongoose = require("mongoose");
// Funciones para la comparacion
const {generateFilingLetter} = require("./Scripts/FilingLetter");
const {generateCertificateOfCompliance}= require('./Scripts/CertificateOfCompliance');
const {generateActivityReports}= require('./Scripts/ActivityReport');
const {generateTaxQuanlityCertificate} = require('./Scripts/TaxQuanlityCertificate');
const {generateRut}=require('./Scripts/Rut');
const {generateRit}= require('./Scripts/Rit');
const {generateInitiationRecord}= require('./Scripts/InitiationRecord');
const {generateAccountCertification} = require('./Scripts/AccountCertification');



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
    const management = req.params.management;

    // Buscar la gestion documetal
    const exitingdocumentManagement = await DocumentManagement.findById(management);
  

    // Si no existe mensaje de respuesta
    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "No existe una gestion documental",
      });
    }

    // Busqueda del usuario para traer NOMBRE CEDULA ,NUMERO DE CELULAR, FECHA DEL CONTRATO, VALOR Y NUMERO
    const ContractUser = await Contractor.findById(exitingdocumentManagement.userContract)
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

    // Verificar que los archivos sean correctos al numero de documentos
    const FieldAll = [
      "filingLetter1.jpg",
      "certificateOfCompliance1.jpg",
      "signedCertificateOfCompliance1.jpg",
      "activityReport1.jpg",
      "activityReport2.jpg",
      "activityReport3.jpg",
      "activityReport4.jpg",
      "activityReport5.jpg",
      "taxQualityCertificate1.jpg",
      "taxQualityCertificate2.jpg",
      "rut1.jpg",
      "rit1.jpg",
      "initiationRecord1.jpg",
      "accountCertification1.jpg",
    ]
    // Recorrer el arreglo y verificar que existan los archivos
    const outputDir = path.join(__dirname, `../../Files/${exitingdocumentManagement.userContract}Img`);

    // Leer la carpta de los archivos
    const files = fs.readdirSync(outputDir);

    // Verificar que los archivos existan
    for(const field of FieldAll){
      if(!files.includes(field)){
        return res.status(400).json({
          success:false,
          message:`Falta el archivo ${field} en la carpeta ${exitingdocumentManagement.userContract}Img`
        });
      }
    }

    // Carta de radicacion FilingLetter
    await generateFilingLetter(UserContractAll);
  
    //Certificado de cumplimiento no firmado
    await generateCertificateOfCompliance(UserContractAll);

    // Certificado de cumplimiento firmado
    //await ThreeFile("signedCertificateOfCompliance", UserContractAll);

    // Informe de actividad
    await generateActivityReports(UserContractAll);

    // Certificado de calidad tributaria
    await generateTaxQuanlityCertificate(UserContractAll);

    // Rut
     await generateRut(UserContractAll);

   // RIT
      await generateRit(UserContractAll);

    // Acta de inicio
     await generateInitiationRecord(UserContractAll);

    // Certificacion bancaria
     await generateAccountCertification(UserContractAll);
 

    return res.status(200).json({
      success: true,
      message: "Analisis completo, Verifica los resultados",
      data: files
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
  console.log('[UPDATEDATA CONTROLLER]')
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
    const FieldAll = [
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
    // Verificar que los archivos sean correctos al numero de documentos
    const outputDir = path.join(__dirname, `../../Files/${exitingdocumentManagement.userContract}Img`);
    // Leer la carpta de los archivos
    const files = fs.readdirSync(outputDir);

    // Verificar si quiere editar cada documentos
    if (field == "filingLetter") {
      // Verificar que el archivo exista
      const fieldFilingLetter =['filingLetter1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldFilingLetter){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }

      await generateFilingLetter(UserContractAll);
      
    } 

    if(field =="certificateOfCompliance"){
      // Verificar que el archivo exista
      const fieldCertificateOfCompliance =['certificateOfCompliance1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldCertificateOfCompliance){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateCertificateOfCompliance(UserContractAll);
    } 

    if(field =="signedCertificateOfCompliance") {
      // Verificar que el archivo exista
      const fieldSignedCertificateOfCompliance =['signedCertificateOfCompliance1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldSignedCertificateOfCompliance){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await ThreeFile("signedCertificateOfCompliance", UserContractAll);
    }

    if(field =="activityReport") {
      // Verificar que el archivo exista
      const fieldActivityReport =['activityReport1.jpg','activityReport2.jpg','activityReport3.jpg','activityReport4.jpg','activityReport5.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldActivityReport){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      console.log('[ENTRANDO A FUNCION DE ANALISIS]')
      await generateActivityReports(UserContractAll);
    }

    if(field =="taxQualityCertificate") {
      // Verificar que el archivo exista
      const fieldTaxQualityCertificate =['taxQualityCertificate1.jpg','taxQualityCertificate2.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldTaxQualityCertificate){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateTaxQuanlityCertificate(UserContractAll);
    }

    if(field =="rut") {
      // Verificar que el archivo exista
      const fieldRut =['rut1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldRut){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateRut(UserContractAll);
    }

    if(field =="rit") {
      // Verificar que el archivo exista
      const fieldRit =['rit1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldRit){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateRit(UserContractAll);
    }

    if(field =="initiationRecord") {
      // Verificar que el archivo exista
      const fieldInitiationRecord =['initiationRecord1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldInitiationRecord){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateInitiationRecord(UserContractAll);;
    }

    if(field =="accountCertification") {
      // Verificar que el archivo exista
      const fieldAccountCertification =['accountCertification1.jpg'];
      // Verificar que los archivos existan
      for(const file of fieldAccountCertification){
        if(!files.includes(file)){
          return res.status(400).json({
            success: false,
            message: `El archivo ${file} no existe en la carpeta de salida`,
          });
        }
      }
      await generateAccountCertification(UserContractAll);
    }

    return res.status(200).json({
      success:true,
      message:`Archivo ${field} Actualizado correctamente verifica los resultados`,
    });                              
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la comparacion",
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
    const FieldSelect =[
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

