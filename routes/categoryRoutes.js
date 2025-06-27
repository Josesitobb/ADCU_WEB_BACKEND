const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// Crear categoria
router.post('/', verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.createCategory);

// Consultar categoria
router.get('/', verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    categoryController.getCategories);

// Consultar categoria por id
router.get('/:id', verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    categoryController.getCategoryById);

// Actualizar por id
router.put('/:id', verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.updateCategory);

// Eliminar por id
router.delete('/:id', verifyToken,
    checkRole('admin'),
    categoryController.deleteCategory);

module.exports = router;