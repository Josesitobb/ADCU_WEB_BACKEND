const express = require('express');
const router = express.Router();
const {getDataVerificactionById} = require('../../controllers/VerificationOfContractData/VerificationOfContractDataController');
const {verifyToken} = require('../../middlewares/Token/authJwt');
const {checkRole}= require('../../middlewares/Role/role');


router.get("/:dataManagemntsId",
    verifyToken,
    checkRole('admin','funcionario','contratista'),
    getDataVerificactionById
)


module.exports = router;