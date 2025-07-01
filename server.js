require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const { MongoClient, ObjecId } = require('mongodb');
// Llamar funcion para inactivar los contratos
require('./controllers/Contracto/inactivarContratos')

//Importar ruta Jose
// Inicio de sesion
const authRoutes = require('./routes/Login/authRoutes');
// Usuarios 
const UserRoutes = require('./routes/Users/userRoutes');

// Contratos
const ContractManagementRoutes = require('./routes/Contracto/ContractManagementRoutes');

const mongoClient = new MongoClient(process.env.MONGODB_URI);

// Importar rutas 
//const authRoutes = require('./routes/authRoutes');
//const userRoutes = require('./routes/userRoutes');
//const categoryRoutes = require('./routes/categoryRoutes');
//const subcategoryRoutes = require('./routes/subcategoryRoutes');
//const productRoutes = require('./routes/productRoutes');


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

//Rutas Jose
// Inicio de sesion
app.use('/api/auth',authRoutes);
// Usuarios
app.use('/api/Users',UserRoutes);
// Contratos
app.use('/api/Contracts',ContractManagementRoutes);

// Rutas 
//app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);
//app.use('/api/categories', categoryRoutes)
//app.use('/api/subcategories', subcategoryRoutes);
//app.use('/api/product', productRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

