require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const gestionRoutes = require('./routes/documentoRoutes.js');
const cors = require('cors');


// Middlewares
app.use(express.json());
app.use(cors())
// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/gestiondocumental')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Rutas
app.use('/api/documentos', gestionRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
