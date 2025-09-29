const express = require("express");
const router = express.Router();
const {
  getDocumentManagementById,
  getAllDocumentManagement,
  createDocumentManagement,
  updateDocumentManagement,
  deleteDocumentManagement,
  getDocumentManagementStats,
  deleteDocumentByContractor,
} = require("../../controllers/DocumentManagement/DocumentManagementController");

const middlewaresFiles = require("../../middlewares/DocumentManagementController/Files");
const {
  VerifyUserContract,
  VerifyExistingDocumentManagement,
} = require("../../middlewares/DocumentManagementController/verifyUserContract");
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

const updateFiles = require("../../middlewares/DocumentManagementController/FilesMulterUpdate");

router.use(verifyToken);

// Ver todas las gestione documental
router.get("/", checkRole("admin", "funcionario"), getAllDocumentManagement);

// Estadisticas de la gestion documental
router.get(
  "/stats",
  checkRole("admin", "funcionario"),
  getDocumentManagementStats
);

// Gestion documental por id
router.get(
  "/:userContract",
  checkRole("admin", "funcionario", "contratista"),
  getDocumentManagementById
);

// Crear la gestion documental
router.post(
  "/:userContract",
  checkRole("admin", "funcionario", "contratista"),
  VerifyUserContract,
  VerifyExistingDocumentManagement,
  middlewaresFiles,
  createDocumentManagement
);

router.put(
  "/:userContract",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  VerifyUserContract,
  updateFiles,
  updateDocumentManagement
);

router.delete(
  "/:userContract",
  verifyToken,
  checkRole("admin", "funcionario"),
  deleteDocumentManagement
);

router.delete(
  "/:userContract/:file",
  verifyToken,
  checkRole("admin"),
  deleteDocumentByContractor
);

module.exports = router;
