const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const funcionarySchema = new mongoose.Schema({
    post:{
        type:String,
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
         required:[true,'Seleccione un usuario para asociar un funcionario']
    }
});

module.exports = mongoose.model('Functionary',funcionarySchema);
