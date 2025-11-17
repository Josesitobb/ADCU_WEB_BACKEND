const multer = require("multer");
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
  destination: (req, file, cd) => {
    const userId = req.params.userContract;
    if (!userId) {
      return cb(new Error("Falta el ID del contratista"), null);
    }

    // Validar id
    if(!mongoose.Types.ObjectId.isValid(userId)){
      return cb(new Error("Id invalida"),null)
    }

    const safeuserContract = path.basename(userId.trim());

    // Verificar si vienen los campos completos
    const nameFiles = [
      "filingLetter",
      "certificateOfCompliance",
      "signedCertificateOfCompliance",
      "activityReport",
      "taxQualityCertificate",
      "socialSecurity",
      "rut",
      "rit",
      "trainings",
      "initiationRecord",
      "accountCertification",
    ];
    if (!nameFiles.includes(file.fieldname)) {
      return cd(new Error("Faltan archivos"));
    }
    // Verificar crear el directorio absoluta
    const directorio = path.join(__dirname, "../../Files", safeuserContract);
 
    try {
      //Crear la carpeta
      fs.mkdirSync(directorio, { recursive: true });
    } catch (error) {
      console.log("Error al crear la carpeta", error);
    }
    // Manda los archivos al directorio
    cd(null, directorio);
  },
  filename: (req, file, cd) => {
    // Renombra los archivos al original
    const extension = path.extname(file.originalname).toLocaleLowerCase().trim();
    if (extension !== ".pdf") {
      return cd(new Error("El archivo no es PDF"));
    }
    const newName = `${file.fieldname}${extension}`;
    cd(null, newName);
  },
});

const upload = multer({ storage });

module.exports = upload;
