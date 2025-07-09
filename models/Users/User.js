
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsersSchemna = new mongoose.Schema({
    name:{
        type:String,
        require:[true,'El nombre de usuario es requerido'],
    },
    lastname:{
        type:String,
        require:[true,'El apellido es requeriodo'],
    },
    idcard:{
        type:Number,
        require:[true,'La cedula es requerida'],
        unique:true
    },
    telephone:{
        type:Number,
        require:[true,'El celular es requerido'],
        unique:true
    },
    email:{
        type:String,
        require:[true,'El correo es requerido'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'La contraseña es requerida']
    },
    role:{
        type:String,
        enum:['admin','contratista','funcionario'],
        default:'contratista'
    }
});

// Hashear la contraseña antes de guardar

UsersSchemna.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Metodo para comparar contraseña
UsersSchemna.methods.VerifyPassword = async function(candidatePassword) {
  console.log("Candidata:", candidatePassword, "\nDel modelo:", this.password);
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports=mongoose.model('User',UsersSchemna);