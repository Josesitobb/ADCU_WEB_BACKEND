require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const config = require('./config');

const app = express();
const httpServer = createServer(app);

// Variables de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 3001;

// 🔌 Configurar Socket.IO
const configureSocketIO = () => {
  try {
    const io = new Server(httpServer, {
      cors: {
        origin: Array.isArray(FRONTEND_URL) ? FRONTEND_URL.split(',') : [FRONTEND_URL],
        methods: ['GET', 'POST'],
        credentials: true
      },
      connectionStateRecovery: {
        maxDisconnectionDuration: 120000
      }
    });

    io.on('connection', (socket) => {
      console.log('🔌 Cliente conectado:', socket.id);
      socket.on('error', (err) => console.error('❌ Error en Socket:', err));
      socket.on('disconnect', (reason) => console.log(`🔌 Cliente ${socket.id} desconectado:`, reason));
    });

    console.log('✅ Socket.IO configurado correctamente');
    return io;
  } catch (error) {
    console.error('❌ Error al configurar Socket.IO:', error);
    process.exit(1);
  }
};

const io = configureSocketIO();

// 📁 Asegurar carpeta uploads
const ensureUploadsDir = () => {
  const uploadsDir = path.join(__dirname, 'uploads/pdfs');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Directorio uploads creado:', uploadsDir);
  }
};
ensureUploadsDir();

// 🧰 Middlewares
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🧠 Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.DB.URL, config.DB.OPTIONS);
    console.log('✅ MongoDB conectado en:', mongoose.connection.host);
    mongoose.connection.on('connected', () => console.log('📌 Mongoose conectado'));
    mongoose.connection.on('error', (err) => console.error('❌ Error de Mongoose:', err));
    mongoose.connection.on('disconnected', () => console.log('⚠️  Mongoose desconectado'));
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

// 🔁 Cargar rutas dinámicamente
const loadRoutes = () => {
  const apiRoutes = express.Router();
  const routeDefinitions = [
    { path: '/auth', route: './routes/authRoutes' },
    { path: '/users', route: './routes/UserRoutes1' },
    { path: '/categories', route: './routes/categoryRoutes' },
    { path: '/subcategories', route: './routes/subcategoryRoutes' },
    { path: '/products', route: './routes/productRoutes' },
    { path: '/reports', route: './routes/reportRoutes' }
  ];

  routeDefinitions.forEach(({ path: routePath, route }) => {
    try {
      const resolvedRoute = require(path.resolve(__dirname, route));
      apiRoutes.use(routePath, resolvedRoute);
      console.log(`✅ Ruta ${routePath} cargada correctamente`);
    } catch (err) {
      console.error(`❌ Error cargando ruta ${routePath}:`, err.message);
    }
  });

  return apiRoutes;
};

app.use('/api/v1', loadRoutes());
console.log('📂 Rutas montadas en /api/v1');

// 🔍 Rutas no encontradas
app.all('*', (req, res) => {
  console.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
});

// 🧯 Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error interno:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// 🟢 Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 Frontend permitido: ${FRONTEND_URL}`);
      console.log('📌 Modelos disponibles:', mongoose.modelNames());
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// ⛔ Apagado limpio
const shutdown = async () => {
  try {
    console.log('\n🛑 Cerrando servidor...');
    await mongoose.connection.close();
    console.log('⏏️  MongoDB desconectado');
    httpServer.close(() => {
      console.log('🛑 Servidor detenido');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error al cerrar:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

