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
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'Selecione un usuario para asociarlo']
    },
    contract:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ContactManagement',
        required:[true,'El usuario tiene que tener un contrato']
    }

})

module.exports = mongoose.model('Contractors',contractorsSchema);
