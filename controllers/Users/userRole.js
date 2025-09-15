const User = require("../../models/Users/User");
const Contractor = require("../../models/Users/Contractor");
const Functionary = require("../../models/Users/Functionary");

// Crear el adminitrador
const createAdmin = async (
  firsName,
  lastName,
  idcard,
  telephone,
  email,
  password,
  state,
  post,
  role
) => {
  try {
    const admin = new User({
      firsName,
      lastName,
      idcard,
      telephone,
      email,
      password,
      state: state || true,
      post,
      role,
    });
    await admin.save();
    return admin;
  } catch (err) {
    const fields = Object.keys(err.keyValue).join(", ");
    throw new Error(`Los siguientes campos ya están en uso: ${fields}`);
  }
};

// Crear funcionario
const createFuncionary = async (
  firsName,
  lastName,
  idcard,
  telephone,
  email,
  password,
  state,
  post,
  role
) => {
  try {
    const funcionarySaved = new User({
      firsName,
      lastName,
      idcard,
      telephone,
      email,
      password,
      state: state || true,
      post,
      role,
    });
    await funcionarySaved.save();

    const funcionary = new Functionary({
      post,
      user: funcionarySaved._id,
    });
    await funcionary.save();

    return funcionary.populate({ path: "user", select: "-password" });
  } catch (err) {
    if (err.code === 11000) {
      const fields = Object.keys(err.keyValue).join(", ");
      throw new Error(`Los siguientes campos ya están en uso: ${fields}`);
    }
  }
};

// Crear contratista
const createContractor = async (
  firsName,
  lastName,
  idcard,
  telephone,
  email,
  password,
  state,
  post,
  role,
  contractId,
  residentialaddress
) => {
  try {
    const contractorSaved = await new User({
      firsName,
      lastName,
      idcard,
      telephone,
      email,
      password,
      state,
      post,
      role,
    });

    await contractorSaved.save();

    const contractor = await new Contractor({
      post,
      user: contractorSaved._id,
      contract: contractId,
      residentialaddress,
    });
    await contractor.save();
    return contractor.populate({ path: "user", select: "-password" });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      const fields = Object.keys(err.keyValue).join(", ");
      throw new Error(`Los siguientes campos ya están en uso: ${fields}`);
    }
  }
};

module.exports = { createAdmin, createFuncionary, createContractor };
