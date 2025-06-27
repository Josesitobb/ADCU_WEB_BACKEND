const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

const validateSubcategory = [
    check('name').not().isEmpty().withMessage('El nombre  es obligatorio'),
    check('description').not().isEmpty().withMessage('La decripcion es obligatoria'),
    check('category').not().isEmpty().withMessage('La categoria es obligatoria')
];

// Rutas
// Crear Subcategoria
router.post('/',
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, subcategoryController.createSubcategory);

// Consultar todos las Subcategoria
router.get('/',
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    subcategoryController.getSubcategories);

// Consultar Subcategoria por id
router.get('/:id', verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    subcategoryController.getSubcategoryById);

// Actualizar Subcategoria
router.put('/:id', verifyToken,
    checkRole('admin', 'coordinador'), validateSubcategory, subcategoryController.updateSubcategory);

// Eliminar Subcategoria
router.delete('/:id', verifyToken,
    checkRole('admin'), subcategoryController.deleteSubcategory);

module.exports = router;




