const pythonExecute = require("../helpers/PythonExecute");

// Primer archivo python
// Carta de radicacion
exports.OneFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,
    UserContractAll.user.telephone,
    UserContractAll.user.email,
    // Datos del contrato
    UserContractAll.contract.typeofcontract,
    UserContractAll.residentialAddress,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.periodValue,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return pythonExecute(ScriptName, dataUserContract);
};

// Segundo archivo python
// Certificado de cumplimiento no firmado
exports.TwoFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del contrato
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.typeofcontract,
    UserContractAll.contract.objectiveContract,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.periodValue,
    UserContractAll.contract.totalValue,

    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,

    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
   return pythonExecute(ScriptName, dataUserContract);
};
// Tercer archivo python
// Certificado de cumplimiento firmado
exports.ThreeFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del contrato
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.typeofcontract,
    UserContractAll.contract.objectiveContract,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.periodValue,
    UserContractAll.contract.totalValue,

    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,

    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  console.log("Data enviada al script Python:", dataUserContract);
  // return pythonExecute(ScriptName, dataUserContract);
};
// Cuarto archivo python
// Informe de actividad
exports.FourFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del contrato
    UserContractAll.contract.typeofcontract,
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.totalValue,
    UserContractAll.contract.periodValue,
    UserContractAll.contract.extension,
    UserContractAll.contract.addiction,
    UserContractAll.contract.suspension,
    UserContractAll.contract.objectiveContract,

    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,

    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return pythonExecute(ScriptName, dataUserContract);
};
// Quinto archivo python
// Certificado de calidad tributaria
exports.FiveFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del contrato
    UserContractAll.contract.contractNumber,
    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,
    UserContractAll.user.email,
    UserContractAll.user.telephone,
    UserContractAll.institutionalEmail,
    UserContractAll.residentialAddress,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return pythonExecute(ScriptName, dataUserContract);
};
// Sexto archivo python
// Rut
exports.SixFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,
    UserContractAll.user.email,
    UserContractAll.user.telephone,
    UserContractAll.EconomicaActivityNumber,
    UserContractAll.residentialAddress,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return await
  
   pythonExecute(ScriptName, dataUserContract);
};

// Septimo archivo python
// RIT
exports.SevenFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,
    UserContractAll.user.email,
    UserContractAll.user.telephone,
    UserContractAll.residentialAddress,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return pythonExecute(ScriptName, dataUserContract);
};

// Octavo archivo python
// Acta de inicio
exports.EightFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del contrato
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,

    // Datos del contrato
    UserContractAll.contract.typeofcontract,
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.totalValue,
    UserContractAll.contract.objectiveContract,

    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,

  ];
   return pythonExecute(ScriptName, dataUserContract);
};

// Noveno archivo python
// Certificacion bancaria
exports.NineFile = async (ScriptName, UserContractAll) => {
  const dataUserContract = [
    // Datos del usuario
    UserContractAll.user.firsName,
    UserContractAll.user.lastName,
    UserContractAll.user.idcard,
    UserContractAll.user.email,
    UserContractAll.user.telephone,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement,
  ];
  return pythonExecute(ScriptName, dataUserContract);
};
