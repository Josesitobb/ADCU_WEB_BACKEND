const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const categoryShema = new mongoose.Schema({

        name:{
            type:String,require:[true,'El nombre es obligatorio'],
            unique: true,
            trim: true
        },
        description : {
            type:String,
            require:[true,'La descripcion es obligatoria']
        }
},{
    timestamps :true,
    versionKey:false,
});

// Eliminar el indice problematico
categoryShema.pre('save',async function(next){
    try{
        const collection = this.constructor.collection;
        const indexes = await collection.indexes();
        // Buscar y eliminar indice problematico con nombre  "nombre_1"
        const problematicIndex = indexes.find(index=>index.name ==="nombre_1");
        if(problematicIndex){
            await collection.dropIndex('nombre_1');

        }
    } catch(err){
        // Ingorar  si el indice no existe
        if(!err.message.includes('Index not found')){
            return next(err);
        }
    }
    next();
});

// Crear nuevo indice correcto 
categoryShema.index({name:1},{
    unique:true,
    name:'name_!'//Nombre explicito para el indice
});

module.exports = mongoose.model('Category',categoryShema);
