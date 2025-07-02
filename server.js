require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads/pdfs');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directorio uploads/pdfs creado exitosamente');
}

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const UserRoutes1 = require('./routes/UserRoutes1');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mongoClient = new MongoClient(process.env.MONGODB_URL);

// Conexión directa a MongoDB
(async () => {
    try {
        await mongoClient.connect();
        app.set('mongoDB', mongoClient.db());
        console.log('Conexión directa a MongoDB establecida');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
    }
})();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB con Mongoose
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tudb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoutes1);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});