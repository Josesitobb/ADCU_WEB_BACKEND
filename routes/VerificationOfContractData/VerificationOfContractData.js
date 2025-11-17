const express = require('express');
const router = express.Router();
const {getDataVerificactionById,getAllDataVerificaction,getVerificationStats} = require('../../controllers/VerificationOfContractData/VerificationOfContractDataController');
const {verifyToken} = require('../../middlewares/Token/authJwt');
const {checkRole}= require('../../middlewares/Role/role');


router.get("/",
    verifyToken,
    checkRole('admin','funcionario'),
    getAllDataVerificaction
);

router.get("/stats",
    verifyToken,
    checkRole('admin','funcionario'),
    getVerificationStats
);

router.get("/:dataManagemntsId",
    verifyToken,
    checkRole('admin','funcionario','contratista'),
    getDataVerificactionById
);

module.exports = router;