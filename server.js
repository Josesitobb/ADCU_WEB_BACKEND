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

// Configuración inicial
const app = express();
const httpServer = createServer(app);

// Configuración mejorada de Socket.IO con manejo de errores
let io;
try {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ? 
             process.env.FRONTEND_URL.split(',') : 
             ['http://localhost:3001'],
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

// Configuración de directorios
const uploadsDir = path.join(__dirname, 'uploads/pdfs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Limitar peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Middlewares básicos
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexión optimizada a MongoDB con verificación de modelos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crudAsadero2', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    
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

// Importación segura de rutas
const loadRoutes = () => {
  const apiRoutes = express.Router();
  
  // Verificación de rutas
  const routes = {
    auth: './routes/authRoutes',
    users: './routes/UserRoutes1',
    categories: './routes/categoryRoutes',
    subcategories: './routes/subcategoryRoutes',
    products: './routes/productRoutes',
    reports: './routes/reportRoutes'
  };

  Object.entries(routes).forEach(([name, path]) => {
    try {
      apiRoutes.use(`/${name}`, require(path));
      console.log(`✅ Ruta ${name} cargada correctamente`);
    } catch (err) {
      console.error(`❌ Error cargando ruta ${name}:`, err.message);
    }
  });

  return apiRoutes;
};

app.use('/api/v1', loadRoutes());

// Manejo de errores global mejorado
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

// WebSockets con manejo de errores
io.on('connection', (socket) => {
  console.log('🔌 Nuevo cliente conectado:', socket.id);
  
  socket.on('error', (err) => {
    console.error('❌ Error en Socket:', err);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Cliente ${socket.id} desconectado:`, reason);
  });
});

// Iniciar servidor con verificación
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
      console.log(`🌍 URL Frontend permitida: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre mejorado
const shutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('⏏️  Conexión a MongoDB cerrada');
    httpServer.close(() => {
      console.log('🛑 Servidor HTTP detenido');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error durante el cierre:', err);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();