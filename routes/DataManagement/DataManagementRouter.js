const express = require("express");
const {getAllDataManagemente,getDataById,createData,savedData,deleteData,updatedData} = require("../../controllers/DataManagement/DataManagementControllers");
const router = express.Router();
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

// ✅ GET: Obtener todos los documentos
router.get(
  "/",
  verifyToken,
  checkRole("admin", "funcionario"),
  getAllDataManagemente
);

// Obtener una comparacion por id
router.get(
  "/:management",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  getDataById
);

// ✅ POST: Guardar documento desde Python u otra fuente
router.post("/saved",
   savedData
  );

// Llamar para comenzar la creacion
router.post(
  "/:management",
  // verifyToken,
  // checkRole("admin", "funcionario", "contratista"),
  createData
);


router.put("/:management/:field",
  updatedData
)

// ✅ DELETE: Eliminar documento (si lo usas desde el frontend)
router.delete("/:management",verifyToken,
  checkRole("admin"), deleteData);

module.exports = router;
