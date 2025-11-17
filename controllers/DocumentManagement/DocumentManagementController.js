const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");
const Contractor = require("../../models/Users/Contractor");
const convertPdfToImages = require("../../utils/convertPdfToImages");
require("dotenv").config();

exports.getDocumentManagementById = async (req, res) => {
  try {
    const documentManagementId = await DocumentManagement.findOne({
      userContract: req.params.userContract,
    }).populate({
      path: "userContract",
      model: "Contractor",
      select:
        "institutionalEmail residentialAddress EconomicaActivityNumber user",
      populate: {
        path: "user",
        model: "User",
        select: "firstName lastName idcard telephone email post role",
      },
    });
    // Verificar que existe el id del documento
    if (!documentManagementId) {
      return res.status(404).json({
        success: false,
        message: "Gestion Documental no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: documentManagementId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al encontrar la Gestion Documental",
      error: error.message,
    });
  }
};

// Todos los documentos
exports.getAllDocumentManagement = async (req, res) => {
  try {
    const documentManagement = await DocumentManagement.find().populate({
      path: "userContract",
      model: "Contractor",
      select:
        "institutionalEmail residentialAddress EconomicaActivityNumber user",
      populate: {
        path: "user",
        model: "User",
        select: "firsName lastName idcard telephone email post role",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Cargado con exito los documentos",
      data: documentManagement,
    });
  } catch (error) {
    console.log(
      "[DocumentManagentController] Error al traer todos los documentos",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al cargar los documentos",
      error: error.messages,
    });
  }
};

exports.createDocumentManagement = async (req, res) => {
  try {
    //  Lo que viene de los archivos
    const {
      filingLetter,
      certificateOfCompliance,
      signedCertificateOfCompliance,
      activityReport,
      taxQualityCertificate,
      socialSecurity,
      rut,
      rit,
      trainings,
      initiationRecord,
      accountCertification,
    } = req.files;
    // Lo que viene del usuario
    const { description, ip, retentionTime, state } = req.body;
    // Id del usuario contratista
    const userContract = req.params.userContract;
    // Fecha de creacion
    const creationDate = new Date();

    // Verificar que los datos del usuario vengan
    if (!description || !ip || !userContract) {
      return res.status(400).json({
        success: false,
        message: "Falta datos",
      });
    }

    // verificar que los archivos se subiero correctos
    if (
      !filingLetter ||
      !certificateOfCompliance ||
      !signedCertificateOfCompliance ||
      !activityReport ||
      !taxQualityCertificate ||
      !socialSecurity ||
      !rut ||
      !rit ||
      !trainings ||
      !initiationRecord ||
      !accountCertification
    ) {
      return res.status(400).json({
        success: false,
        message: "Le faltan archivos porfa verificar muchas gracias",
      });
    }

    // Evitar inyecion sql
    if (!mongoose.Types.ObjectId.isValid(userContract)) {
      return res.status(400).json({
        success: false,
        message: "Id no valido",
      });
    }

    // Tener solo la primera parte del la peticion
    const safeuserContract = path.basename(userContract);

    // Verificar el directorio
    const directory = path.join(
      __dirname,
      "../../Files",
      safeuserContract,
      "Img"
    );

    // Si el directorio no existe crea la carpeta
    fs.mkdirSync(directory, { recursive: true });

    // Carta de radicacion de cuenta de cobro
    const File1 = filingLetter?.[0]?.path;
    console.log(File1);
    await convertPdfToImages(File1, directory, "filingLetter", 1);

    // Certificado de cumplimiento
    const File2 = certificateOfCompliance?.[0]?.path;
    await convertPdfToImages(File2, directory, "certificateOfCompliance", 1);

    // Ceritifcado de cumplimiento firmado
    const File3 = signedCertificateOfCompliance?.[0]?.path;
    await convertPdfToImages(
      File3,
      directory,
      "signedCertificateOfCompliance",
      1
    );

    // Reporte de actividad
    const File4 = activityReport?.[0]?.path;
    await convertPdfToImages(File4, directory, "activityReport", 5);

    // Certificado de calidad tributaria
    const File5 = taxQualityCertificate?.[0]?.path;
    await convertPdfToImages(File5, directory, "taxQualityCertificate", 2);

    // social security
    const File6 = socialSecurity?.[0]?.path;
    await convertPdfToImages(File6, directory, "socialSecurity", 2);

    //rut
    const File7 = rut?.[0]?.path;
    await convertPdfToImages(File7, directory, "rut", 1);

    // rit
    const File8 = rit?.[0]?.path;
    await convertPdfToImages(File8, directory, "rit", 1);

    // Capacitaciones
    const File9 = trainings?.[0]?.path;
    await convertPdfToImages(File9, directory, "Trainings", 5);

    // Acta de inicio
    const File10 = initiationRecord?.[0]?.path;
    await convertPdfToImages(File10, directory, "initiationRecord", 1);

    // Certificacion de cuenta
    const File11 = accountCertification?.[0]?.path;
    await convertPdfToImages(File11, directory, "accountCertification", 1);

    // Creacion en la base de datos
    const newDocumentManagement = new DocumentManagement({
      creationDate,
      retentionTime: retentionTime || 5,
      ip,
      state: state || true,
      description,
      version: 1,
      userCreate: userContract,
      userEdition: userContract,
      userContract: userContract,
      filingLetter: File1,
      certificateOfCompliance: File2,
      signedCertificateOfCompliance: File3,
      activityReport: File4,
      taxQualityCertificate: File5,
      socialSecurity: File6,
      rut: File7,
      rit: File8,
      trainings: File9,
      initiationRecord: File10,
      accountCertification: File11,
    });

    const documentManagementSaved = await newDocumentManagement.save();
    return res.status(200).json({
      success: true,
      message: "Documentos cargados exitosamente",
      data: documentManagementSaved,
    });
  } catch (error) {
    if (error.code == 11000) {
      return res.status(400).json({
        success: false,
        message: "No puede subir 2 veces los mismo archivos",
      });
    }
    console.log(
      "[DocumentManagentController] Error al crear un documento",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Error al cargar los documentos",
      error: error.message,
    });
  }
};

exports.updateDocumentManagement = async (req, res) => {
  try {
    // Varaibles que viene en la peticion
    const userContract = req.params.userContract;
    const userEdit = req.userId;

    // Variables que viene del req.files
    const {
      filingLetter,
      certificateOfCompliance,
      signedCertificateOfCompliance,
      activityReport,
      taxQualityCertificate,
      socialSecurity,
      rut,
      rit,
      trainings,
      initiationRecord,
      accountCertification,
    } = req.files;

    // Varibles que viene del body;
    const { description, ip, retentionTime, state } = req.body;

    // Consulta para ver si existe la gestion documental
    const documenteMangementeUser = await DocumentManagement.findOne({
      userContract: userContract,
    });

    if (!documenteMangementeUser) {
      return res.status(404).json({
        success: false,
        message: "No hay gestión documental relacionada con este usuario",
      });
    }

    // Ruta a donde esta las imagenes
    const outputDir = path.resolve(
      __dirname,
      "../../Files/",
      `${documenteMangementeUser.userContract}Img`
    );

    // Filing Letter
    if (filingLetter) {
      const newFilePath = filingLetter[0].path;
      documenteMangementeUser.filingLetter = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "filingLetter", 1);
    }

    // Certificate of Compliance
    if (certificateOfCompliance) {
      const newFilePath = certificateOfCompliance[0].path;
      documenteMangementeUser.certificateOfCompliance = newFilePath;
      await convertPdfToImages(
        newFilePath,
        outputDir,
        "certificateOfCompliance",
        1
      );
    }

    // Signed Certificate of Compliance
    if (signedCertificateOfCompliance) {
      const newFilePath = signedCertificateOfCompliance[0].path;
      documenteMangementeUser.signedCertificateOfCompliance = newFilePath;
      await convertPdfToImages(
        newFilePath,
        outputDir,
        "signedCertificateOfCompliance",
        1
      );
    }

    // Activity Report
    if (activityReport) {
      const newFilePath = activityReport[0].path;
      documenteMangementeUser.activityReport = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "activityReport", 5);
    }

    // Tax Quality Certificate
    if (taxQualityCertificate) {
      const newFilePath = taxQualityCertificate[0].path;
      documenteMangementeUser.taxQualityCertificate = newFilePath;
      await convertPdfToImages(
        newFilePath,
        outputDir,
        "taxQualityCertificate",
        2
      );
    }

    // Social Security
    if (socialSecurity) {
      const newFilePath = socialSecurity[0].path;
      documenteMangementeUser.socialSecurity = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "socialSecurity", 2);
    }

    // RUT
    if (rut) {
      const newFilePath = rut[0].path;
      documenteMangementeUser.rut = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "rut", 1);
    }

    // RIT
    if (rit) {
      const newFilePath = rit[0].path;
      documenteMangementeUser.rit = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "rit", 1);
    }

    // Trainings
    if (trainings) {
      const newFilePath = trainings[0].path;
      documenteMangementeUser.trainings = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "trainings", 5);
    }

    // Initiation Record
    if (initiationRecord) {
      const newFilePath = initiationRecord[0].path;
      documenteMangementeUser.initiationRecord = newFilePath;
      await convertPdfToImages(newFilePath, outputDir, "initiationRecord", 1);
    }

    // Account Certification
    if (accountCertification) {
      const newFilePath = accountCertification[0].path;
      documenteMangementeUser.accountCertification = newFilePath;
      await convertPdfToImages(
        newFilePath,
        outputDir,
        "accountCertification",
        1
      );
    }

    // Usuario que edita
    documenteMangementeUser.userEdition = userEdit;
    // Version
    documenteMangementeUser.version += 1;

    // Varibles que pueden editar el usuario que no son documentos
    if (ip) documenteMangementeUser.ip = ip;
    if (state !== undefined) documenteMangementeUser.state = state;
    if (description) documenteMangementeUser.description = description;
    if (retentionTime) documenteMangementeUser.retentionTime = retentionTime;

    await documenteMangementeUser.save();
    return res.status(200).json({
      success: true,
      message: "Documento actualizado correctamente",
      data: documenteMangementeUser,
    });
  } catch (error) {
    console.error("[UpdateDocument_Management] Error:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el documento",
      error: error.message,
    });
  }
};

exports.deleteDocumentManagement = async (req, res) => {
  try {
    // Primera buscar el id del usuario
    const searchDocumentManagementUser = await DocumentManagement.findOne({
      userContract: req.params.userContract,
    });

    // Verificar si existe
    if (!searchDocumentManagementUser) {
      return res.status(404).json({
        success: false,
        message: "No se existe un gestion documental con ese id de usuario",
      });
    }
    // Pasar la id a una varibales para evitar futuros daños
    const userContrac = searchDocumentManagementUser.userContract;

    // Eliminar la carpeta del usuario
    const folderPath = path.join(__dirname, `../../Files/${userContrac}`);
    // Eliminar la carpte de las imaganes
    const folderPathImg = path.join(__dirname, `../../Files/${userContrac}Img`);

    // Eliminar la carpeta con los pdf
    fs.rmSync(folderPath, { recursive: true, force: true });
    // Eliminar la carpeta de las imaganes
    fs.rmSync(folderPathImg, { recursive: true, force: true });

    // Eliminar la gestion documental
    await DocumentManagement.deleteOne({
      userContract: req.params.userContract,
    });

    return res.status(200).json({
      success: true,
      message: "Documento y carpeta eliminados correctamente",
    });
  } catch (error) {
    console.error("[DeleteDocument_Management] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar el documento",
      error: error.message,
    });
  }
};

exports.deleteDocumentByContractor = async (req, res) => {
  try {
    const { userContract, file } = req.params;

    // Validar que sea un id de mongo
    if (!mongoose.Types.ObjectId.isValid(userContract)) {
      return res.status(400).json({
        success: false,
        message: "Id invalido",
      });
    }

    // Evitar noSqlInyeccion
    const safeuserContract = path.basename(userContract.trim());
    const query = { userContract: safeuserContract };

    const exitingdocumentManagement = await DocumentManagement.findOne(query);
    if (!exitingdocumentManagement) {
      return res.status(404).json({
        success: false,
        message: "No existe una gestion documental con ese id de usuario",
      });
    }

    const validFiles = [
      "filingLetter",
      "certificateOfCompliance",
      "signedCertificateOfCompliance",
      "activityReport",
      "taxQualityCertificate",
      "socialSecurity",
      "rut",
      "rit",
      "trainings",
      "initiationRecord",
      "accountCertification",
    ];
    if (!validFiles.includes(file)) {
      return res.status(400).json({
        success: false,
        message: "El nombre del archivo no es valido",
      });
    }

    // Ruta a donde esta las imagenes
    const outputDir = path.join(
      __dirname,
      "../../Files",
      safeuserContract,
      "Img"
    );

    //Leer todos los archivos de la carpeta del usuario
    fs.readdir(outputDir, (err, files) => {
      if (err) return console.log("Error", err);

      // Filtrar todos los archis con el nombre
      const toDelete = files.filter((u) => u.startsWith(file));
      // Iterar por cada archivo
      for (const u in toDelete) {
        const newPath = path.join(outputDir, toDelete[u]);
        fs.promises.unlink(newPath);
      }
    });

    // Borrar el pdf
    const outputDirPdf = path.join(
      __dirname,
      "../../Files",
      safeuserContract,
      file + ".pdf"
    );

    // Ejecutar la promesa para eliminar
    fs.promises.unlink(outputDirPdf).catch((err) => {
      if (err === "ENOENT")
        console.log(
          "Archivo ya eliminado porfa volver a subir un archivo nuevo",
          err
        );
    });

    // Cambiar la ruta por archivo eliminado
    exitingdocumentManagement[file] = "Archivo eliminado";

    // Gurdarlo en la base de datos
    await exitingdocumentManagement.save();

    return res.status(200).json({
      success: true,
      message: `Archivos ${file} eliminado correctamente`,
    });
  } catch (error) {
    console.log(
      "[DataMangementControllers] Error al borrar un documento",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Error al borrar un documento",
      error: error.message,
    });
  }
};

exports.getDocumentManagementStats = async (req, res) => {
  try {
    let stats;
    // Total de documentos
    const totalDocuments = await DocumentManagement.find();

    // Conteo total de documentos
    const totalCount = totalDocuments.length;

    // Contratista sin gestion documental
    // consulta todos los contratistas
    const contractors = await Contractor.find();
    const contractorsWithDocs = contractors.length - totalCount;

    // Documentos activos e inactivos
    const activeDocuments = totalDocuments.filter(
      (doc) => doc.state === true
    ).length;
    // Documentos inactivos
    const inactiveDocuments = totalDocuments.filter(
      (doc) => doc.state === false
    ).length;

    // Contratos sin gestion documental
    let ContractsWithoutDocumentManagement = 0;

    for (const d of totalDocuments) {
      if (d.filingLetter) ContractsWithoutDocumentManagement++;
      if (d.certificateOfCompliance) ContractsWithoutDocumentManagement++;
      if (d.signedCertificateOfCompliance) ContractsWithoutDocumentManagement++;
      if (d.activityReport) ContractsWithoutDocumentManagement++;
      if (d.taxQualityCertificate) ContractsWithoutDocumentManagement++;
      if (d.socialSecurity) ContractsWithoutDocumentManagement++;
      if (d.rut) ContractsWithoutDocumentManagement++;
      if (d.rit) ContractsWithoutDocumentManagement++;
      if (d.trainings) ContractsWithoutDocumentManagement++;
      if (d.initiationRecord) ContractsWithoutDocumentManagement++;
      if (d.accountCertification) ContractsWithoutDocumentManagement++;
    }

    stats = {
      "total de documentos": totalCount,
      "documentos activos": activeDocuments,
      "documentos inactivos": inactiveDocuments,
      "Documentos en el sistema": ContractsWithoutDocumentManagement,
      "Contratistas sin gestiones documentales": contractorsWithDocs,
    };

    return res.status(200).json({
      success: true,
      message: "Estadísticas de gestión documental obtenidas correctamente",
      data: stats,
    });
  } catch (error) {
    console.error("[GetDocumentManagementStats] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las estadísticas de gestión documental",
      error: error.message,
    });
  }
};
