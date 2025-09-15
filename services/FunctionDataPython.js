const pythonExecute = require("../helpers/PythonExecute");

exports.OneFile = async (ScriptName, UserContract) => {
  const dataUserContract = [
    UserContract.user.firsName,
    UserContract.user.lastName,
    UserContract.user.idcard,
    UserContract.user.telephone,
    UserContract.user.email,
    UserContract.addresContractor,
    UserContract.contract.typeContract,
    UserContract.contract.endDate,
    UserContract.contract.typeofcontract,
    UserContract.contract.price,
    UserContract.contract._id
  ];
  return pythonExecute(ScriptName,dataUserContract);
};
