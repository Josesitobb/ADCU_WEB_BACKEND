const express = require('express');
const router = express.Router();
const ContactManagement = require('../../controllers/Contracto/ContractManagementController');

// Get
// Todos los contratos
router.get('/',ContactManagement.getAllContract);

// Crear un contrato
router.post('/',ContactManagement.creatContract);

// Contrato espesifico 
router.get('/:id',ContactManagement.getContractById);

// Contrato actualizar
router.put('/:id',ContactManagement.updateContract);

// Contrato eliminar
router.delete('/:id',ContactManagement.deleteContract);

module.exports = router;
