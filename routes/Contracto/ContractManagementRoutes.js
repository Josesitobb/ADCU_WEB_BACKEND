const express = require("express");
const router = express.Router();
const {
  getAllContract,
  getStateContracts,
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
  checkRole("admin", "funcionario"),
  updateContract
);

// Contrato eliminar
router.delete("/:id", verifyToken, checkRole("admin"), deleteContract);

module.exports = router;
