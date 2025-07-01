const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');


const validateProduct = [
    check('name').not().isEmpty().withMessage('El nombre es obligario'),
    check('description').not().isEmpty().withMessage('La descripcion es obligatoria '),
    check('price').isFloat({ min: 0 }).withMessage('Precio invalido'),
    check('stock').isInt({ min: 0 }).withMessage('stock ivalido'),
    check('category').not().isEmpty().withMessage('La categoria es requerida'),
    check('subcategory').not().isEmpty().withMessage('La subcategoria es requerida')
];
// Crear producto
router.post('/', verifyToken,
    checkRole('admin', 'coordinador'), validateProduct,
    productController.createProduct);

// Consultar productos
router.get('/', verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    productController.getProducts);

// Consultar productos por id
router.get('/:id', verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    productController.getProductById);

// Actualizar producto por id
router.put('/:id', verifyToken,
    checkRole('admin', 'coordinador'),
    validateProduct, productController.updateProduct);

// Borrar producto por id
router.delete('/:id', verifyToken,
    checkRole('admin'), productController.deleteProduct);

module.exports = router;



