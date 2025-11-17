const express = require("express");
const {getAllDataManagemente,getDataById,createData,deleteData,updatedData,toogleStateData,getDataStats} = require("../../controllers/DataManagement/DataManagementControllers");
const router = express.Router();
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");


// GET: Obtener todos los documentos
router.get(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  getAllDataManagemente
);


router.get("/stats", 
  verifyToken,
  checkRole("admin", "funcionario"), getDataStats);


// Obtener una comparacion por id
router.get(
  "/:management",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  getDataById
);

// Llamar para comenzar la creacion
router.post(
  "/:management",
  verifyToken,
  // checkRole("admin", "funcionario", "contratista"),
  createData
);

// Actualizar
router.put("/:management/:field",
  updatedData
);

// Cambiar el estado del documento
router.patch("/:management/:field/toggle",
  verifyToken,
  checkRole("admin", "funcionario"),
  toogleStateData
);

// ✅ DELETE: Eliminar documento (si lo usas desde el frontend)
router.delete("/:management",
  verifyToken,
  checkRole("admin"), deleteData);


module.exports = router;
