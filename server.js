require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { MongoClient, ObjecId } = require('mongodb');

// Importar rutas 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const dataRoutes = require('./routes/dataRoutes');
const resultRoutes = require('./routes/resultRoutes');
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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes)
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/results', resultRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

