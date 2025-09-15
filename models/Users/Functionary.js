const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const funcionarySchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         required:[true,'Seleccione un usuario para asociar un funcionario']
    }
});

module.exports = mongoose.model('Functionary',funcionarySchema);
