const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const ContracSchema = new mongoose.Schema({
    typeofcontract:{
        type:String,
        required:[true,'El tipo de contrato es requerido'],
        enum:['Contrato termino fijo','Contrato indefinodo','Contrato obra labor']
    },
    starteDate:{
        type:Date,
        required:[true,'La fecha de inicio es requerida']
    },
    endDate :{
        type:Date,
        require:[true,'La fecha fin es requerida']
    },
    contractNumber:{
        type:Number,
        required:[true,'El numero de contrato es requerido'],
        unique:true
    },
    state:{
        type:String,
        enum:['Activo','Inactivo'],
        default:'Activo'
    }
    
})

module.exports = mongoose.model("ContactManagement",ContracSchema);

