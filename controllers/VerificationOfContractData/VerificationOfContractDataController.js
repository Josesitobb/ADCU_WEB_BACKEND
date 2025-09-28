const DataManagement = require("../../models/DataManagements/DataManagements");
const VerificationOfContractData = require("../../models/VerificationOfContractData/VerificationOfContractData");
const Contractor = require("../../models/Users/Contractor");

// Obtener una comparacion de datos por id y validar que todos los campos este en true, si no dar una descripcion
exports.getDataVerificactionById = async (req, res) => {
  try {
    const dataManagemntsId = req.params.dataManagemntsId;

    // Verifica si existe un gestion de datos con ese contractor
    const existinDataManagement = await DataManagement.findById(
      dataManagemntsId
    );

    if (!existinDataManagement) {
      return res.status(404).json({
        success: true,
        message: "No existe una gestion de datos con ese contratista",
      });
    }

    // Verificar el estado que viene de la comparacion
    let dataStatus = [];
    if (existinDataManagement.filingLetter?.status === false)
      dataStatus.push({ document: "filingLetter" });

    if (existinDataManagement.certificateOfCompliance?.status === false)
      dataStatus.push({ document: "certificateOfCompliance" });

    if (existinDataManagement.signedCertificateOfCompliance?.status === false)
      dataStatus.push({ document: "signedCertificateOfCompliance" });

    if (existinDataManagement.activityReport?.status === false)
      dataStatus.push({ document: "activityReport" });

    if (existinDataManagement.taxQualityCertificate?.status === false)
      dataStatus.push({ document: "taxQualityCertificate" });

    if (existinDataManagement.rut?.status === false)
      dataStatus.push({ document: "rut" });

    if (existinDataManagement.rit?.status === false)
      dataStatus.push({ document: "rit" });

    if (existinDataManagement.initiationRecord?.status === false)
      dataStatus.push({ document: "initiationRecord" });

    if (existinDataManagement.accountCertification?.status === false)
      dataStatus.push({ document: "accountCertification" });

    // Verificar si vino algo de array
    let state = dataStatus.length === 0;

    let description = state
      ? "Todos los documentos fueron aprobados "
      : `Todavía faltan documentos por analizar: ${dataStatus
          .map((d) => d.document)
          .join(", ")}`;

    // Verificar si ya existe una verificación asociada a esta gestión
    let verification = await VerificationOfContractData.findOne({
      dataManagemnts: existinDataManagement._id,
    });

    if (verification) {
      verification.state = state;
      verification.description = description;
      await verification.save();
    } else {
      verification = new VerificationOfContractData({
        state,
        description,
        dataManagemnts: existinDataManagement._id,
      });
      await verification.save();
    }

    return res.status(200).json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error("Error en getDataVerificactionById:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.getAllDataVerificaction = async (req, res) => {
  try {
    const allVerifications = await VerificationOfContractData.find().populate({
      path: "dataManagemnts",
      select: "firsName lastName idcard telephone email",
    });

    return res.status(200).json({
      success: true,
      data: allVerifications,
    });
  } catch (error) {
    console.error("Error en getAllDataVerificaction:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};

exports.getVerificationStats = async (req, res) => {
  try {
    let stats = {};

    const totalVerifications = await VerificationOfContractData.find();
    // Conteo total de verificaciones
    const totalCount = totalVerifications.length;
    // Verificaciones aprobadas y no aprobadas
    const approvedVerifications = totalVerifications.filter(
      (ver) => ver.state === true
    ).length;
    const rejectedVerifications = totalVerifications.filter(
      (ver) => ver.state === false
    ).length;
    const contractor = await Contractor.find();
    const contractorPendingVerifications = contractor.length - totalCount;

    stats = {
      "Total de verificaciones": totalCount,
      "Verificaciones aprobadas": approvedVerifications,
      "Verificaciones rechazadas": rejectedVerifications,
      "Usuarios contratos que no han sido verificados":contractorPendingVerifications,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error en getVerificationStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
    });
  }
};
