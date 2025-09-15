const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchemna = new mongoose.Schema({
  firsName: {
    type: String,
    required: [true, "El nombre de usuario es requerido"],
    trim: true,
    maxlength: [
      50,
      "El nombre de usuario  no puede extenderse a mas de 50 caracteres",
    ],
  },
  lastName: {
    type: String,
    require: [true, "El apellido es requeriodo"],
    trim: true,
  },
  idcard: {
    type: Number,
    required: [true, "La cedula es requerida"],
    trim: true,
    unique: true,
  },
  telephone: {
    type: Number,
    require: [true, "El celular es requerido"],
    trim: true,
    unique: true,
    maxlength: [10, "El telefono es de 10 numero"],
    minlength: [10, "El telefono es de 10 numero"],
    match: [/^3\d{9}$/, "El celular debe iniciar con 3 y tener 10 dígitos"],
  },
  email: {
    type: String,
    required: [true, "El correo es requerido"],
    trim: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    trim: true,
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  state: {
    type: Boolean,
    required: ["Requiere un estado", true],
    default: true,
  },
  post: {
    type: String,
    required: [true, "El cargo es obligatorio"],
  },
  role: {
    type: String,
    enum: ["admin", "contratista", "funcionario"],
    default: "contratista",
  },
});

// Hashear la contraseña antes de guardar
userSchemna.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo para comparar contraseña
userSchemna.methods.VerifyPassword = async function (candidatePassword) {
  console.log("Candidata:", candidatePassword, "\nDel modelo:", this.password);
  return await bcrypt.compare(candidatePassword, this.password);
};

// 
module.exports = mongoose.model("User", userSchemna);
