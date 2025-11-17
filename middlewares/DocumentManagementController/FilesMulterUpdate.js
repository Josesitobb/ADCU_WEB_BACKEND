const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userContract;

    if (!userId) {
      return cb(new Error("Falta el ID del contratista"), null);
    }

    // Validar id
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return cb(new Error("Id invalida"), null);
    }

    const safeuserContract = path.basename(userId.trim());

    const dir = path.join(__dirname, "../../Files", safeuserContract);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    // Solo permitir PDF
    if (extension !== ".pdf") {
      return cb(new Error("El archivo no es PDF"));
    }

    // Renombrar al nombre del campo del input + .pdf
    const newName = `${file.fieldname}${extension}`;
    cb(null, newName);
  },
});

const upload = multer({ storage });

module.exports = upload.fields([
  { name: "filingLetter", maxCount: 1 },
  { name: "certificateOfCompliance", maxCount: 1 },
  { name: "signedCertificateOfCompliance", maxCount: 1 },
  { name: "activityReport", maxCount: 1 },
  { name: "taxQualityCertificate", maxCount: 1 },
  { name: "socialSecurity", maxCount: 1 },
  { name: "rut", maxCount: 1 },
  { name: "rit", maxCount: 1 },
  { name: "trainings", maxCount: 1 },
  { name: "initiationRecord", maxCount: 1 },
  { name: "accountCertification", maxCount: 1 },
]);
