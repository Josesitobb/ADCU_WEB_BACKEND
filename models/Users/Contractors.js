const { type } = require('express/lib/response');
const mongoose = require('mongoose');


const contractorsSchema = new mongoose.Schema({
    post:{
        type :String,
        require:[true,'El cargo es obligatorio'],
    },
    state:{
        type:String,
        enum:['Activo','Inactivo'],
        default:'Activo'
    },
    Users:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        require:[true,'Selecione un usuario para asociarlo']
    },
    Contracts:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contratos',
        require:[true,'El usuario tiene que tener un contrato']
    }

})

module.exports = mongoose.model('Contractors',contractorsSchema);
