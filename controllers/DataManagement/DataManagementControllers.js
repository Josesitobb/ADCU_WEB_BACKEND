const fs = require("node:fs");
const path = require("node:path");
const Contractor = require("../../models/Users/Contractor");
const DataManagements = require("../../models/DataManagements/DataManagements");
const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");
const mongoose = require("mongoose");
// Funciones para la comparacion
const { generateFilingLetter } = require("./Scripts/FilingLetter");
const { generateCertificateOfCompliance } = require('./Scripts/CertificateOfCompliance');
const { generateActivityReports } = require('./Scripts/ActivityReport');
const { generateTaxQuanlityCertificate } = require('./Scripts/TaxQuanlityCertificate');
const { generateRut } = require('./Scripts/Rut');
const { generateRit } = require('./Scripts/Rit');
const { generateInitiationRecord } = require('./Scripts/InitiationRecord');
const { generateAccountCertification } = require('./Scripts/AccountCertification');




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
    const { management } = req.params;
    const existinDataManagement = await DocumentManagement.findById(management);
    if (!existinDataManagement) {
      return res.status(404).json({
        success: false,
        message: "No existe una gestion documental con ese id",
      });
    }
    const dataManagementeId = await DataManagements.findOne({documentManagement: management});

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
    const outputDir = path.join(__dirname, `../../Files/${exitingdocumentManagement.userContract}/Img`);

    // Leer la carpta de los archivos
    const files = fs.readdirSync(outputDir);

    // Verificar que los archivos existan
    for (const field of FieldAll) {
      if (!files.includes(field)) {
        return res.status(400).json({
          success: false,
          message: `Falta el archivo ${field} en la carpeta ${exitingdocumentManagement.userContract}Img`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Se esta ejecutando el analisis en 2 plano'
    });

    setImmediate(async () => {

      try {
        // Carta de radicacion FilingLetter
        await generateFilingLetter(UserContractAll);
        console.log("[BackgroundJob] FilingLetter OK");

        //Certificado de cumplimiento no firmado
        await generateCertificateOfCompliance(UserContractAll);
        console.log("[BackgroundJob] Certificate OK");

        //await ThreeFile("signedCertificateOfCompliance", UserContractAll);

        // Informe de actividad
        await generateActivityReports(UserContractAll);
        console.log("[BackgroundJob] Activity Reports OK");

        // Certificado de cumplimiento firmado

        // Certificado de calidad tributaria
        await generateTaxQuanlityCertificate(UserContractAll);
        console.log("[BackgroundJob] Tax OK");


        // Rut
        await generateRut(UserContractAll);
        console.log("[BackgroundJob] RUT OK");

        // RIT
        await generateRit(UserContractAll);
        console.log("[BackgroundJob] RIT OK");

        // Acta de inicio
        await generateInitiationRecord(UserContractAll);
        console.log("[BackgroundJob] Initiation Record OK");


        // Certificacion bancaria
        await generateAccountCertification(UserContractAll);
        console.log("[BackgroundJob] Bank OK");

        console.log("[BackgroundJob] Análisis COMPLETADO ✔");
      } catch (e) {
        console.error("[BackgroundJob] Error:", e);
      }

    })

  } catch (error) {
    console.error("[CreateData] Error al crear una comparacion:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatedData = async (req, res) => {
  console.log('[UPDATEDATA CONTROLLER]');
  const { management, field } = req.params;

  try {
    const exitingdocumentManagement = await DocumentManagement.findById(management);

    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "No exise una gestion documental con ese id",
      });
    }

    const ContractUser = await Contractor.findById(
      exitingdocumentManagement.userContract
    )
      .populate("user", "firsName lastName idcard telephone email")
      .populate(
        "contract",
        "typeofcontract startDate endDate contractNumber periodValue totalValue objectiveContract extension addiction suspension"
      );

    if (!ContractUser) {
      return res.status(404).json({
        success: false,
        message:
          "No se encontro un contratista con la gestion documental asociada",
      });
    }

    const UserContractAll = ContractUser.toObject();
    UserContractAll.documentManagement = exitingdocumentManagement._id;

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

    const outputDir = path.join(
      __dirname,
      `../../Files/${exitingdocumentManagement.userContract}/Img`
    );
    const files = fs.readdirSync(outputDir);

    // ------------------------------------------------------
    // 1) RESPUESTA INMEDIATA AL USUARIO
    // ------------------------------------------------------
    res.status(202).json({
      success: true,
      message:
        "El documento se está procesando. Verifica los resultados en unos minutos.",
    });

    // ------------------------------------------------------
    // 2) PROCESAMIENTO PESADO EN SEGUNDO PLANO
    // ------------------------------------------------------
    setImmediate(async () => {
      try {
        if (field == "filingLetter") {
          const needed = ["filingLetter1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateFilingLetter(UserContractAll);
        }

        if (field == "certificateOfCompliance") {
          const needed = ["certificateOfCompliance1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateCertificateOfCompliance(UserContractAll);
        }

        if (field == "signedCertificateOfCompliance") {
          const needed = ["signedCertificateOfCompliance1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await ThreeFile("signedCertificateOfCompliance", UserContractAll);
        }

        if (field == "activityReport") {
          const needed = [
            "activityReport1.jpg",
            "activityReport2.jpg",
            "activityReport3.jpg",
            "activityReport4.jpg",
            "activityReport5.jpg",
          ];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          console.log("[ENTRANDO A FUNCION DE ANALISIS]");
          await generateActivityReports(UserContractAll);
        }

        if (field == "taxQualityCertificate") {
          const needed = ["taxQualityCertificate1.jpg", "taxQualityCertificate2.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateTaxQuanlityCertificate(UserContractAll);
        }

        if (field == "rut") {
          const needed = ["rut1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateRut(UserContractAll);
        }

        if (field == "rit") {
          const needed = ["rit1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateRit(UserContractAll);
        }

        if (field == "initiationRecord") {
          const needed = ["initiationRecord1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateInitiationRecord(UserContractAll);
        }

        if (field == "accountCertification") {
          const needed = ["accountCertification1.jpg"];
          for (const f of needed) {
            if (!files.includes(f)) {
              console.log(`[ERROR] Falta archivo: ${f}`);
              return;
            }
          }
          await generateAccountCertification(UserContractAll);
        }

        console.log(" ANÁLISIS FINALIZADO PARA:", field);
      } catch (err) {
        console.error("Error en análisis en background:", err);
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la comparación",
      error: error.message,
    });
  }
};



exports.deleteData = async (req, res) => {
  try {
    const { management } = req.params;

    if (!mongoose.Types.ObjectId.isValid(management)) {
      return res.status(400).json({
        success: false,
        message: 'El id de la gestion documental no es valido'
      });
    }

    const safeManagement = management.trim();


    // Verificar si existe una gestion documental
    const documentManagementExisting = await DocumentManagement.findById(safeManagement);
    if (!documentManagementExisting) {
      return res.status(404).json({
        success: false,
        message: 'No existe una gestion documental con ese id'
      });
    }

    // Borrar la gestion de datos
    const query = { documentManagement: documentManagementExisting._id };

    const newDelete = await DataManagements.findOneAndDelete(query);


    if (!newDelete) {
      return res.status(404).json({
        success: false,
        message: 'No se encontro una comparacion con ese id'
      });
    }

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


exports.toogleStateData = async (req, res) => {
  try {

    const { management, field } = req.params;

    const existinDocumentManagement = await DocumentManagement.findById(management);

    if (!existinDocumentManagement) {
      return res.status(404).json({
        success: false,
        message: 'No existe una gestion documental'
      });
    }

    // Verificar que venga el documento correctos
    const FieldSelect = [
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

    const existinDataManagement = await DataManagements.findOne({ documentManagement: existinDocumentManagement._id });


    if (!existinDataManagement) {
      return res.status(404).json({
        success: false,
        message: 'No hay una gestion de datos asociada a esta gestion documental'
      })
    }

    existinDataManagement[field].status = !existinDataManagement[field].status;
    existinDataManagement[field].description = "ok"

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

    stats = {
      'total de documentos': totalCount,
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

