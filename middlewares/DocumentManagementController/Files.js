const upload = require("./FilesMulter");

const middlewaresFiles = upload.fields([
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

module.exports = middlewaresFiles;
