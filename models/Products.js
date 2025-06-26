
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
productSchema.statics.generateReportData = async function(filters = {}) {
    const products = await this.find(filters)
        .populate('category', 'name')
        .populate('subcategory', 'name')
        .lean();

    return products.map(product => ({
        Nombre: product.name,
        Descripción: product.description,
        Precio: `$${product.price.toFixed(2)}`,
        Stock: product.stock,
        Categoría: product.category?.name || 'N/A',
        Subcategoría: product.subcategory?.name || 'N/A',
        Fecha_Creación: new Date(product.createdAt).toLocaleDateString()
    }))
}

module.exports = mongoose.model('product', productSchema);

