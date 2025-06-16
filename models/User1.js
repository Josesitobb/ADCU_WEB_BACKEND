const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schemaasdss({
    username:  {
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        lowercase: true,
        trim: true

    },
    password:{
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        select: false
    },

    role: {type: String, default:'auxiliar', enum: ['admin','coordinador','auxiliar']},

},{ 

timestamps: true,
versionKey: false

});

//hash de contraseña antes de guardar 
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    try{
        const salt  = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password,salt);
        next();

    }catch(error){
        next(error)
    }
});

module.exports = mongoose.model('user', userSchema);