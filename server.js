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
const config = require('./config'); // Asegúrate que el path sea correcto

// Configuración inicial
const app = express();
const httpServer = createServer(app);

// Variables de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Socket.IO
let io;
try {
  io = new Server(httpServer, {
    cors: {
      origin: Array.isArray(process.env.FRONTEND_URL)
        ? process.env.FRONTEND_URL.split(',')
        : [FRONTEND_URL],
      methods: ['GET', 'POST'],
      credentials: true
    },
    connectionStateRecovery: {
      maxDisconnectionDuration: 120000
    }
  });
  console.log('✅ Socket.IO configurado correctamente');
} catch (error) {
  console.error('❌ Error al configurar Socket.IO:', error);
  process.exit(1);
}

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads/pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL, // ya tomado de .env
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🧠 CONEXIÓN A MONGODB usando config.js
const connectDB = async () => {
  try {
    await mongoose.connect(config.DB.URL, config.DB.OPTIONS);
    console.log('✅ MongoDB conectado en:', mongoose.connection.host);
    console.log('📌 Modelos disponibles:', mongoose.modelNames());

    mongoose.connection.on('connected', () => {
      console.log('📌 Mongoose conectado');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  Mongoose desconectado');
    });
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

// Rutas
const loadRoutes = () => {
  const apiRoutes = express.Router();
  const routes = {
    auth: './routes/authRoutes',
    users: './routes/UserRoutes1',
    categories: './routes/categoryRoutes',
    subcategories: './routes/subcategoryRoutes',
    products: './routes/productRoutes',
    reports: './routes/reportRoutes'
  };
  Object.entries(routes).forEach(([name, routePath]) => {
    try {
      apiRoutes.use(`/${name}`, require(routePath));
      console.log(`✅ Ruta ${name} cargada correctamente`);
    } catch (err) {
      console.error(`❌ Error cargando ruta ${name}:`, err.message);
    }
  });
  return apiRoutes;
};
app.use('/api/v1', loadRoutes());

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

// WebSockets
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);
  socket.on('error', (err) => {
    console.error('❌ Error en Socket:', err);
  });
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Cliente ${socket.id} desconectado:`, reason);
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`🌍 Frontend permitido: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre
const shutdown = async () => {
  try {
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

