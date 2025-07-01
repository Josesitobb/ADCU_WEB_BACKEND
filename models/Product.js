
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required :[true,'El nombre es obligatorio'],
        trim:true,
        unique:true
    },
    description : {
        type:String,
        required:[true,'La descripcion es obligatoria'],
        trim : true
    },
    price:{
        type:Number,
        required:[true,'El precio es obligatorio'],
        trim:true,
        min:[0,'El precio no puede ser negativo']
    },
    stock:{
        type: Number,
        required:[true,'El stock es requerido'],
        min:[0,'El stock no pueder ser negativo']
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:[true,'La categoria es requerida']
    },
    subcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Subcategory',
        required:[true,'La subcategoria es requerida']
    },
    images:[{
        type:String
    }]

},{
    timestamps:true,
    versionKey:false
});

// Manejo de error  de duplicados
productSchema.post('save',function(error,doc,next){
    if(error.name === 'MongoServerError' && error.code ===11000){
        next(new Error('Ya existe un producto con ese nombre'));
    }else{
        next(error)
    }
})

module.exports = mongoose.model('product', productSchema);

