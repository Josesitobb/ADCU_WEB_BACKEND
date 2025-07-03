import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import documentoRoutes from './routes/documentoRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/documentos', documentoRoutes);

// Conexión a MongoDB
mongoose
  .connect('mongodb://localhost:27017/gestion_datos', {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('✅ Conexión a MongoDB exitosa');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error conectando a MongoDB:', error);
  });
