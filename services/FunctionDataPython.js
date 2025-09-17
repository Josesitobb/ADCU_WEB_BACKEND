const pythonExecute = require("../helpers/PythonExecute");

// Primer archivo python
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
    UserContractAll.residentialaddress,
    UserContractAll.contract.startDate,
    UserContractAll.contract.endDate,
    UserContractAll.contract.contractNumber,
    UserContractAll.contract.price,
    // Id Del usuario
    UserContractAll._id,
    UserContractAll.documentManagement
  ];
  console.log("Data enviada al script Python:", dataUserContract);
  return pythonExecute(ScriptName, dataUserContract);
};

// Segundo archivo python
exports.TwoFile = async (ScriptName, data) => {
console.log("Archivo dos")
}
// Tercer archivo python
exports.ThreeFile = async (ScriptName, data) => {
console.log("Archivo tres")
}
// Cuarto archivo python
exports.FourFile = async (ScriptName, data) => {
console.log("Archivo cuatro")
}
// Quinto archivo python
exports.FiveFile = async (ScriptName, data) => {
console.log("Archivo cinco")
}
// Sexto archivo python
exports.SixFile = async (ScriptName, data) => {
console.log("Archivo seis")
}

// Septimo archivo python 
exports.SevenFile = async (ScriptName, data) => {
  return pythonExecute(ScriptName, data);
}
