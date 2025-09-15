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
    ref: "ContactManagement",
    unique: true,
    require: [true, "El usuario tiene que tener un contrato"],
  },
  residentialaddress: {
    type: String,
    require: [
      true,
      "Ingrese la direccion del usuario al que se le quiera hacer el contrato",
    ],
    require: [true, "El contratista necesita una direccion"],
  },
});

module.exports = mongoose.model("Contractor", contractorSchema);
