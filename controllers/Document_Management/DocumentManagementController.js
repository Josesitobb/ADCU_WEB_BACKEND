const Document_Management = require("../../models/DocumentManagement/DocumentManagement");
const Contractor = require("../../models/Users/Contractor");
const User = require("../../models/Users/Functionary");
const fs = require("fs");
const path = require("path");
const convertPdfToImages = require("../../utils/convertPdfToImages");

exports.getDocumentManagementById = async (req, res) => {
  try {
    const documentManagementId = await Document_Management.findById(
      req.params.id
    );
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
    const documentManagement = await Document_Management.find();
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

exports.CreateDocument_Management = async (req, res) => {
  try {
  //  Lo que viene de los archivos
    const {filing_letter,certificate_of_compliance,signed_certificate_of_compliance,activity_report,tax_quality_certificate,social_security,rut,rit,Trainings,initiation_record,account_certification} = req.files;
    // Lo que viene del usuario
    const { description, ip, retention_time, state, version } = req.body;
    // Id del usuario contratista
    const userContract = req.params.userContract;
    // Fecha de creacion
    const creation_date = new Date();

    // Verificar que los datos del usuario vengan
     if (!description ||!ip || !retention_time || !state ||!version ||!userContract) {
      return res.status(400).json({
        success: false,
        message: "Falta datos",
      });
    }

    // verificar que los archivos se subiero correctos
    if (!filing_letter ||!certificate_of_compliance ||!signed_certificate_of_compliance ||!activity_report ||!tax_quality_certificate ||!social_security ||!rut ||!rit ||!Trainings ||!initiation_record ||!account_certification) {
      res.status(400).json({
        success: false,
        message: "Le falta archivos",
      });
    }

    // Verificar el directorio
    const directory = path.join(__dirname, `../../Files/${userContract}Img`);

    // Si el directorio no existe crea la carpeta
      fs.mkdirSync(directory, { recursive: true });
    
    // baseUrl = "C:\\Users\\JoseD\\OneDrive\\Documentos\\ADCU_WEB_BACKEND";
    const baseUrl = "C:/Users/SENA/OneDrive/Documentos/ADCU/ADCU_WEB_BACKEND";
    // Carta de radicacion de cuenta de cobro
    const File1 = path.relative(baseUrl, filing_letter?.[0]?.path);
    const file1 = await convertPdfToImages(File1, directory, "filing_letter");

    // Certificado de cumplimiento
    const File2 = path.relative(baseUrl, certificate_of_compliance?.[0]?.path);
     const file2 = await convertPdfToImages(File2,directory,"certificate_of_compliance");

    // Ceritifcado de cumplimiento firmado
    const File3 = path.relative(baseUrl,signed_certificate_of_compliance?.[0]?.path);
    const file3 = await convertPdfToImages(File3,directory,"signed_certificate_of_compliance");

    // Reporte de actividad
    const File4 = path.relative(baseUrl, activity_report?.[0]?.path);
    const file4 = await convertPdfToImages(File4, directory, "activity_report");

    // Certificado de calidad tributaria
    const File5 = path.relative(baseUrl, tax_quality_certificate?.[0]?.path);
    const file5 = await convertPdfToImages(File5,directory,"tax_quality_certificate");

    // social security
    const File6 = path.relative(baseUrl, social_security?.[0]?.path);
    const file6 = await convertPdfToImages(File6, directory, "social_security");

    //rut
    const File7 = path.relative(baseUrl, rut?.[0]?.path);
    const file7 = await convertPdfToImages(File7, directory, "rut");

    // rit
    const File8 = path.relative(baseUrl, rit?.[0]?.path);
    const file8 = await convertPdfToImages(File8, directory, "rit");

    // Capacitaciones
    const File9 = path.relative(baseUrl, Trainings?.[0]?.path);
    const file9 = await convertPdfToImages(File9, directory, "Trainings");

    // Acta de inicio
    const File10 = path.relative(baseUrl, initiation_record?.[0]?.path);
    const file10 = await convertPdfToImages(File10,directory,"initiation_record");

    // Certificacion de cuenta
    const File11 = path.relative(baseUrl, account_certification?.[0]?.path);
    const file11 = await convertPdfToImages(File11,directory,"account_certification");

  
    // Creacion en la base de datos
    const newDocumentManagement = new Document_Management({
      creation_date,
      retention_time: "20 años",
      ip,
      state: true || state,
      description,
      version,
      user_create:userContract,
      user_edition:userContract,
      user_contrac:userContract,
      filing_letter: File1,
      certificate_of_compliance: File2,
      signed_certificate_of_compliance: File3,
      activity_report: File4,
      tax_quality_certificate: File5,
      social_security: File6,
      rut: File7,
      rit: File8,
      Trainings: File9,
      initiation_record: File10,
      account_certification: File11,
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

exports.UpdateDocument_Management = async (req, res) => {
  try {
    // Consulta para ver si existe la gestion documental
        const documenteMangementeUser = await Document_Management.findOne({user_create: req.params.user_contract});
      if (!documenteMangementeUser) {
      return res.status(404).json({
        success: false,
        message: "No hay gestión documental relacionada con este usuario",
      });
    }

    // Variables que viene del req.files
     const {filing_letter,certificate_of_compliance,signed_certificate_of_compliance,activity_report,tax_quality_certificate,social_security,rut,rit,Trainings,initiation_record,account_certification} = req.files;

    // Varibles que viene del body;
     const { description, ip, retention_time, state } = req.body;

    // Ruta a donde esta las imagenes
     const outputDir = path.resolve(
        __dirname,
        "../../Files/",
        `${documenteMangementeUser.user_contrac}Img`
      );
      // Ruta para quitar 
      const baseUrl = path.resolve(__dirname, "../../");

    // Filing Letter
    if (filing_letter) {
      const newFilePath = filing_letter[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.filing_letter = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "filing_letter");
    }

    // Certificate of Compliance
       if (certificate_of_compliance) {
      const newFilePath = certificate_of_compliance[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.certificate_of_compliance = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "certificate_of_compliance");
    }

      // Signed Certificate of Compliance
    if (signed_certificate_of_compliance) {
      const newFilePath = signed_certificate_of_compliance[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.signed_certificate_of_compliance = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "signed_certificate_of_compliance");
    }

     // Activity Report
    if (activity_report) {
      const newFilePath = activity_report[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.activity_report = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "activity_report");
    }

       // Tax Quality Certificate
    if (tax_quality_certificate) {
      const newFilePath = tax_quality_certificate[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.tax_quality_certificate = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "tax_quality_certificate");
    }

      // Social Security
    if (social_security) {
      const newFilePath = social_security[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.social_security = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "social_security");
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
    if (Trainings) {
      const newFilePath = Trainings[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.Trainings = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "Trainings");
    }

     // Initiation Record
    if (initiation_record) {
      const newFilePath = initiation_record[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.initiation_record = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "initiation_record");
    }

     // Account Certification
    if (account_certification) {
      const newFilePath = account_certification[0].path;
      const relativePath = path.relative(baseUrl, newFilePath);
      documenteMangementeUser.account_certification = relativePath;
      await convertPdfToImages(newFilePath, outputDir, "account_certification");
    }

    // Usuario que edita
    documenteMangementeUser.user_edition = req.userId;
    // Version
    documenteMangementeUser.version +1;

    // Varibles que pueden editar el usuario que no son documentos
    if(ip) documenteMangementeUser.ip = ip; 
    if(state) documenteMangementeUser.state = state;
    if(description) documenteMangementeUser.description = description;
    if(retention_time) documenteMangementeUser.retention_time = retention_time;
 
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

exports.DeleteDocument_Management = async (req, res) => {
  try {
    // Primera buscar el id del usuario
    const searchDocumentManagementUser = await Document_Management.findOne({
      user_create: req.params.userContract,
    });

    // Verificar si existe
    if (!searchDocumentManagementUser) {
      return res.status(404).json({
        success: false,
        message: "No se existe un gestion documental con ese id de usuario",
      });
    }
    // Pasar la id a una varibales para evitar futuros daños
    const user_contrac = searchDocumentManagementUser.user_contrac;

    // Eliminar la carpeta del usuario
    const folderPath = path.join(__dirname, `../../Files/${user_contrac}`);
    // Eliminar la carpte de las imaganes
    const folderPathImg = path.join( __dirname, `../../Files/${user_contrac}Img`);

    // Eliminar la carpeta con los pdf
    fs.rmSync(folderPath, { recursive: true, force: true });
    // Eliminar la carpeta de las imaganes
    fs.rmSync(folderPathImg, { recursive: true, force: true });

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
