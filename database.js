const mongoose = require('mongoose');
const { DB } = require('./config');  // Corregido: debe importar el objeto DB completo

const connectDB = async () => {
    try {
        await mongoose.connect(DB.URL, {  // Corregido: usar DB.URL en lugar de DB_URI
            useNewUrlParser: true,  // Corregido: "userNewUrlParser" -> "useNewUrlParser"
            useUnifiedTopology: true  // Corregido: "userUifiedTopology" -> "useUnifiedTopology"
        });
        console.log('✓ MongoDB conectado');  // Mejorado el mensaje de éxito
    } catch (err) {
        console.error('✗ Error de conexión a MongoDB:', err.message);  // Corregida la coma por dos puntos
        process.exit(1);
    }
};

module.exports = connectDB;