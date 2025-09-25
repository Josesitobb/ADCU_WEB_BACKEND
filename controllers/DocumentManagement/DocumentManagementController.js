const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");
const Contractor = require("../../models/Users/Contractor");
const User = require("../../models/Users/Functionary");
const fs = require("fs");
const path = require("path");
const convertPdfToImages = require("../../utils/convertPdfToImages");

exports.getDocumentManagementById = async (req, res) => {
  try {

    const documentManagementId = await DocumentManagement.findOne({ userContract: req.params.userContract });
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
    const documentManagement = await DocumentManagement.find();
    return res.status(200).json({
      success: true,
      message: "Cargado con exito los documentos",
      data: documentManagement,
    });
  } catch (error) {
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
    const {filingLetter,certificateOfCompliance,signedCertificateOfCompliance,activityReport,taxQualityCertificate,socialSecurity,rut,rit,trainings,initiationRecord,accountCertification} = req.files;
    // Lo que viene del usuario
    const { description, ip, retentionTime, state } = req.body;
    // Id del usuario contratista
    const userContract = req.params.userContract;
    // Fecha de creacion
    const creationDate = new Date();

    // Verificar que los datos del usuario vengan
     if (!description ||!ip ||!userContract) {
      return res.status(400).json({
        success: false,
        message: "Falta datos",
      });
    }

    console.log("req.files:", req.files);
    // verificar que los archivos se subiero correctos
    if (!filingLetter ||!certificateOfCompliance ||!signedCertificateOfCompliance ||!activityReport ||!taxQualityCertificate ||!socialSecurity ||!rut ||!rit ||!trainings ||!initiationRecord ||!accountCertification) {
      return res.status(400).json({
        success: false,
        message: "Le faltan archivos porfa verificar muchas gracias",
      });
    }

    // Verificar el directorio
    const directory = path.join(__dirname, `../../Files/${userContract}Img`);

    // Si el directorio no existe crea la carpeta
      fs.mkdirSync(directory, { recursive: true });
    
    // baseUrl = "C:\\Users\\JoseD\\OneDrive\\Documentos\\ADCU_WEB_BACKEND";
    const baseUrl = "C:/Users/SENA/OneDrive/Documentos/ADCU/ADCU_WEB_BACKEND";
    // Carta de radicacion de cuenta de cobro
    const File1 = path.relative(baseUrl, filingLetter?.[0]?.path);
    const file1 = await convertPdfToImages(File1, directory, "filingLetter");

    // Certificado de cumplimiento
    const File2 = path.relative(baseUrl, certificateOfCompliance?.[0]?.path);
     const file2 = await convertPdfToImages(File2,directory,"certificateOfCompliance");

    // Ceritifcado de cumplimiento firmado
    const File3 = path.relative(baseUrl,signedCertificateOfCompliance?.[0]?.path);
    const file3 = await convertPdfToImages(File3,directory,"signedCertificateOfCompliance");

    // Reporte de actividad
    const File4 = path.relative(baseUrl, activityReport?.[0]?.path);
    const file4 = await convertPdfToImages(File4, directory, "activityReport");

    // Certificado de calidad tributaria
    const File5 = path.relative(baseUrl, taxQualityCertificate?.[0]?.path);
    const file5 = await convertPdfToImages(File5,directory,"taxQualityCertificate");

    // social security
    const File6 = path.relative(baseUrl, socialSecurity?.[0]?.path);
    const file6 = await convertPdfToImages(File6, directory, "socialSecurity");

    //rut
    const File7 = path.relative(baseUrl, rut?.[0]?.path);
    const file7 = await convertPdfToImages(File7, directory, "rut");

    // rit
    const File8 = path.relative(baseUrl, rit?.[0]?.path);
    const file8 = await convertPdfToImages(File8, directory, "rit");

    // Capacitaciones
    const File9 = path.relative(baseUrl, trainings?.[0]?.path);
    const file9 = await convertPdfToImages(File9, directory, "Trainings");

    // Acta de inicio
    const File10 = path.relative(baseUrl, initiationRecord?.[0]?.path);
    const file10 = await convertPdfToImages(File10,directory,"initiationRecord");

    // Certificacion de cuenta
    const File11 = path.relative(baseUrl, accountCertification?.[0]?.path);
    const file11 = await convertPdfToImages(File11,directory,"accountCertification");

  
    // Creacion en la base de datos
    const newDocumentManagement = new DocumentManagement({
      creationDate,
      retentionTime: retentionTime || 5,
      ip,
      state: state || true,
      description,
      version: 1,
      userCreate:userContract,
      userEdition:userContract,
      userContract:userContract,
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
    // Consulta para ver si existe la gestion documental
        const documenteMangementeUser = await DocumentManagement.findOne({userContract: req.params.userContract});
      if (!documenteMangementeUser) {
      return res.status(404).json({
        success: false,
        message: "No hay gestión documental relacionada con este usuario",
      });
    }

    // Variables que viene del req.files
     const {filingLetter,certificateOfCompliance,signedCertificateOfCompliance,activityReport,taxQualityCertificate,socialSecurity,rut,rit,trainings,initiationRecord,accountCertification} = req.files;

    // Varibles que viene del body;
     const { description, ip, retentionTime, state } = req.body;

    // Ruta a donde esta las imagenes
     const outputDir = path.resolve(
        __dirname,
        "../../Files/",
        `${documenteMangementeUser.userContract}Img` // FIX nombre correcto
      );
      // Ruta para quitar 
      const baseUrl = path.resolve(__dirname, "../../");

    // Filing Letter
    if (filingLetter) {
      const newFilePath = filingLetter[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.filingLetter = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "filingLetter");
    }

    // Certificate of Compliance
       if (certificateOfCompliance) {
      const newFilePath = certificateOfCompliance[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.certificateOfCompliance = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "certificateOfCompliance");
    }

      // Signed Certificate of Compliance
    if (signedCertificateOfCompliance) {
      const newFilePath = signedCertificateOfCompliance[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.signedCertificateOfCompliance = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "signedCertificateOfCompliance");
    }

     // Activity Report
    if (activityReport) {
      const newFilePath = activityReport[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.activityReport = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "activityReport");
    }

       // Tax Quality Certificate
    if (taxQualityCertificate) {
      const newFilePath = taxQualityCertificate[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.taxQualityCertificate = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "taxQualityCertificate");
    }

      // Social Security
    if (socialSecurity) {
      const newFilePath = socialSecurity[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.socialSecurity = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "socialSecurity");
    }

      // RUT
    if (rut) {
      const newFilePath = rut[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.rut = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "rut");
    }

    // RIT
    if (rit) {
      const newFilePath = rit[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.rit = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "rit");
    }

    
    // Trainings
    if (trainings) {
      const newFilePath = trainings[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.trainings = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "trainings");
    }

     // Initiation Record
    if (initiationRecord) {
      const newFilePath = initiationRecord[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.initiationRecord = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "initiationRecord");
    }

     // Account Certification
    if (accountCertification) {
      const newFilePath = accountCertification[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.accountCertification = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "accountCertification");
    }

    // Usuario que edita
    documenteMangementeUser.userEdition = req.userId;
    // Version
    documenteMangementeUser.version += 1;

    // Varibles que pueden editar el usuario que no son documentos
    if(ip) documenteMangementeUser.ip = ip; 
    if(state !== undefined) documenteMangementeUser.state = state;
    if(description) documenteMangementeUser.description = description;
    if(retentionTime) documenteMangementeUser.retentionTime = retentionTime;
 
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
    const folderPathImg = path.join( __dirname, `../../Files/${userContrac}Img`);

    // Eliminar la carpeta con los pdf
    fs.rmSync(folderPath, { recursive: true, force: true });
    // Eliminar la carpeta de las imaganes
    fs.rmSync(folderPathImg, { recursive: true, force: true });

    // Eliminar la gestion documental
    await DocumentManagement.deleteOne({ userContract: req.params.userContract });

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
