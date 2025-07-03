const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const basename = path.basename(__filename);
const db = {};

// Configura la conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crudAsadero2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    });
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  }
};

// Carga todos los modelos automáticamente
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      !file.includes('.test.js')
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    db[model.modelName] = model;
  });

// Configura las relaciones (si son necesarias)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Manejo de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('📌 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose desconectado de MongoDB');
});

// Exporta la conexión y los modelos
db.mongoose = mongoose;
db.connectDB = connectDB;

module.exports = db;