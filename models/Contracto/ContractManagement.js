const mongoose = require("mongoose");

const ContracSchema = new mongoose.Schema({
  typeofcontract: {
    type: String,
    require: [true, "El tipo de contrato es requerido"],
    enum: [
      "Contrato termino fijo",
      "Contrato indefinodo",
      "Contrato obra labor",
      "Contrato de prestacion de servicios",
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
  price: {
    type: Number,
    require: [true, "Ingrese un valor para el contracto"],
  },
});


ContracSchema.pre('save',function(next){
  if(this.startDate < this.endDate){
    throw next (Error("La fecha de fin no puede ser menor a la fecha de inicio"))
  }
})


module.exports = mongoose.model("ContactManagement", ContracSchema);
