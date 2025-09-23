const mongoose = require("mongoose");
const { extensions } = require("sequelize/lib/utils/validator-extras");

const ContracSchema = new mongoose.Schema({
  typeofcontract: {
    type: String,
    require: [true, "El tipo de contrato es requerido"],
    enum: [
      "Presentacion de servicios",
      "Termino fijo",
      "Termino indefinido",
      "Obra o labor",
      "Aprendizaje",
      "Ocasional o transitorio",
    ],
  },
  startDate: {
    type: String,
    require: [true, "La fecha de inicio es requerida"],
  },
  endDate: {
    type: String,
    require: [true, "La fecha fin es requerida"],
  },
  contractNumber: {
    type: String,
    require: [true, "El numero de contrato es requerido"],
    unique: true,
  },
  state: {
    type: Boolean,
    default: true,
  },
  periodValue: {
    type: String,
    require: [true, "El periodo de cobro es requerido"],
  },
  totalValue: {
    type: Number,
    require: [true, "Ingrese el valor total del contrato"],
  },
  objectiveContract: {
    type: String,
    require: [true, "El objetivo del contrato es requerido"],
  },
  extension: {
    type: Boolean,
    default: false,
  },
  addiction: {
    type: Boolean,
    default: false,
  },
  suspension: {
    type: Boolean,
    default: false,
  },
});

ContracSchema.pre("save", function (next) {
  if (new Date(this.startDate) > new Date(this.endDate)) {
    throw next(
      Error("La fecha de fin no puede ser menor a la fecha de inicio")
    );
  }
  next();
});

module.exports = mongoose.model("contractManagement", ContracSchema);
