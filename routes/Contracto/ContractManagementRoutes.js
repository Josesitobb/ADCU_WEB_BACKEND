const express = require("express");
const router = express.Router();
const {
  getAllContract,
  getStateContracts,
  getStatsContract,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
} = require("../../controllers/Contracto/ContractManagementController");
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

// Todos los contratos
router.get("/", verifyToken, checkRole("admin", "funcionario"), getAllContract);


// Obtener solo los contratos activos
router.get("/contractActive",
  verifyToken,
  checkRole("admin", "funcionario"),
  getStateContracts
);


// Obtener stadisticas de los contratos
router.get("/stats",
  verifyToken,
  checkRole("admin", "funcionario"),
  getStatsContract
);


// Contrato espesifico
router.get(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  getContractById
);


// Crear un contrato
router.post(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  createContract
);


// Contrato actualizar
router.put(
  "/:id",
  verifyToken,
  checkRole("admin"),
  updateContract
);

// Contrato eliminar
router.delete("/:id", verifyToken, checkRole("admin"), deleteContract);

module.exports = router;
