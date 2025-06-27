const express = require('express');
const router = express.Router();
const productController = require('../controllers/producControllers');
const {check} = require('express-validator');

const validateProduct = [
    check('name').not().isEmpty().withMessage('El nombre es obligario'),
    check('description').not().isEmpty().withMessage('La descripcion es obligatoria '),
    check('price').isFloat({min:0 }).withMessage('Precio invalido'),
    check('stock').isInt({min:0 }).withMessage('stock ivalido'),
    check ('category').not().isEmpty().withMessage('La categoria es requerida'),
    check('subcategory').not().isEmpty().withMessage('La subcategoria es requerida')
];
router.post('/', validateProduct, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id',productController.getProductById);
router.put('/:id',validateProduct, productController.updateProduct);
router.delete('/:id',productController.deleteProduct);

    const { generateProductReport } = require('../controllers/reportController');
router.get('/report/excel', generateProductReport); 
    

module.exports = router;



