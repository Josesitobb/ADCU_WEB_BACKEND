const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllAdmin,
  getAllFuncionary,
  getAllContractor,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../../controllers/Users/userControllers");
const { verifyToken } = require("../../middlewares/Token/authJwt");
const { checkRole } = require("../../middlewares/Role/role");

// GET /api/Users
router.get("/", verifyToken, checkRole("admin", "funcionario"), getAllUsers);

// Traer los usuario admin
router.get("/Admin", verifyToken, getAllAdmin);

// Traer los usuario funcionarios
router.get("/Funcionary", verifyToken, getAllFuncionary);

// Traer los usuario Contratista
router.get("/Contractor", verifyToken, getAllContractor);

// Estadistica de usuarios
router.get("/stats", verifyToken, getUserStats);

//POST /API/Users
router.post(
  "/",
  verifyToken,
  checkRole('admin','funcionario'),
  createUser
);

// GET /api/Users/:id
router.get(
  "/:id",
  verifyToken,
  checkRole("admin", "funcionario", "contratista"),
  getUserById
);

//PUT /api/Users/:id
router.put("/:id", verifyToken, checkRole("admin", "funcionario"), updateUser);

//DELETE /api/users/:id
router.delete("/:id", verifyToken, checkRole("admin"), deleteUser);

module.exports = router;
