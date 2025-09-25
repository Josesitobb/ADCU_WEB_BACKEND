const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const verificationOfContractData = new mongoose.Schema({ 
 state:{
    type:Boolean,
    default:false
 },
 description:{
    type:String,
    require:[true,'Es obligatorio tener una descripcion']
 },
 dataManagemnts :{
  type:mongoose.Schema.Types.ObjectId,
  ref:'dataManagements',
  require:['Es requerido el id de la gestion de datos',true]
 }

});


module.exports = mongoose.model("verificationOfContractData",verificationOfContractData);