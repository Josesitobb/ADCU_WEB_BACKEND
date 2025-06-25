require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { MongoClient, ObjecId } = require('mongodb');

// Importar rutas 
const gestionDocumentalRoutes = require('./routes/gestionDocumentalRoutes');
const mongoClient = new MongoClient(process.env.MONGODB_URI);

(async () => {
    await mongoClient.connect();
    app.set('mongoDB', mongoClient.db());
    console.log('Conexion directa a mongoDB establecida')
});

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a mongo db
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Ok MongoDB conectado')).catch(err => console.error('x Erro de MongoDB', err));

// Rutas 
app.use('/api/gestionDocumental', gestionDocumentalRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

