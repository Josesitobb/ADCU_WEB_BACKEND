const Contractor = require("../../models/Users/Contractor");
const DocumentManagement = require("../../models/DocumentManagement/DocumentManagement");

exports.VerifyUserContract = async (req, res, next) => {
  try {
    const userId = req.params.userContract;
    const verifyContractors = await Contractor.findById(userId);
    if (!verifyContractors) {
      return res.status(404).json({
        success: false,
        message: "El contratista no existe",
      });
    }

    // req.userContract = userId; // Para seguir usándolo más adelante
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al buscar el contratista",
      error: error.message,
    });
  }
};

exports.VerifyExistingDocumentManagement = async (req, res, next) => {
  try {
    const userId = req.params.userContract;
    const existingDocument = await DocumentManagement.findOne({
      userContract: userId,
    });
    if (existingDocument) {
      return res.status(400).json({
        success: false,
        message: "El contratista ya tiene una gestión documental registrada",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al verificar la gestión documental",
      error: error.message,
    });
  }
};
