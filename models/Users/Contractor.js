const { type } = require('express/lib/response');
const mongoose = require('mongoose');


const contractorsSchema = new mongoose.Schema({
    post:{
        type :String,
        required:[true,'El cargo es obligatorio'],
    },
    state:{
        type:String,
        enum:['Activo','Inactivo'],
        default:'Activo'
    },
    User:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'Selecione un usuario para asociarlo']
    },
    Contract:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contratos',
        required:[true,'El usuario tiene que tener un contrato']
    }

})

module.exports = mongoose.model('Contractors',contractorsSchema);
