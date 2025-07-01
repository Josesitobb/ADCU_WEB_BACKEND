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
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mongoclient = new MongoClient(process.env.MONGOODB_URL);

(async () => {
  await mongoclient.connect();
  app.set('mongoDB', mongoclient.db());
  console.log('Conexion directa a mongoDB establecida');
})();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a mongo db
mongoose.connect(process.env.MONGOODB_URL).then(() => console.log('Ok Mongo'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/reports', reportRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
