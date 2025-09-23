const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const { findOne } = require("./User");

const contractorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: [true, "Selecione un usuario para asociarlo"],
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contractManagement",
    unique: true,
    require: [true, "El usuario tiene que tener un contrato"],
  },
  residentialAddress: {
    type: String,
    require: [
      true,
      "Ingrese la direccion del usuario al que se le quiera hacer el contrato",
    ]
  },
  institutionalEmail: {
    type: String,
    require: [true, "El contratista necesita un correo institucional"],
    unique: true,
  },
  EconomicaActivityNumber: {
    type: String,
    require: [true, "El contratista necesita una actividad economica"],
  },

});

module.exports = mongoose.model("Contractor", contractorSchema);
