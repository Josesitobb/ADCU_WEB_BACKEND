require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config");
const { MongoClient, ObjecId } = require("mongodb");
const path = require("node:path");

// Llamar funcion para inactivar los contratos
require("./controllers/Contracto/inactivarContratos");

//Importar ruta Jose

// Inicio de sesion
const authRoutes = require("./routes/Login/authRoutes");
// Usuarios
const UserRoutes = require("./routes/Users/userRoutes");

// Contratos
const ContractManagementRoutes = require("./routes/Contracto/ContractManagementRoutes");

// Gestion Documental
const DocumentManagementRoutes = require("./routes/DocumentManagement/DocumentManagementRouter");

//Gestion de datos
const DataManagement = require("./routes/DataManagement/DataManagementRouter");

// Verificacion de la gestion de datos
const VerificationOfContractData = require("./routes/VerificationOfContractData/VerificationOfContractData");


const mongoClient = new MongoClient(process.env.MONGODB_URI);

async () => {
  await mongoClient.connect();
  app.set("mongoDB", mongoClient.db());
  console.log("Conexion directa a mongoDB establecida");
};

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a mongo db
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Ok MongoDB conectado"))
  .catch((err) => console.error("x Erro de MongoDB", err));

// Inicio de sesion
app.use("/api/auth", authRoutes);
// Usuarios
app.use("/api/Users", UserRoutes);
// Contratos
app.use("/api/Contracts", ContractManagementRoutes);
// Gestion documental
app.use("/api/Documents", DocumentManagementRoutes);
// Ver pdf
app.use("./Files", express.static(path.join(__dirname, "uploads")));
// Gestion de datos
app.use("/api/Data", DataManagement);
// Verificacion de datos
app.use("/api/Verification", VerificationOfContractData);


//   // Data api
//   app.use("/", (req, res) => {
//     res.send(`

//    Bienvenido a la API de ADCU
//    <br>

//    Endpoints:
//   // Inicio de sesion
//    Post: /api/auth/signin 
//    <br>

//   //  Gestion de usuarios:
//   Get: /api/users  
//   <br>

//   //  Gestion de contratos:
//   Get: /api/Contracts   
//    <br>

//   // Gestion documental:
//   Get: /api/Documents  
//    <br>

//   // Gestion de datos
//   Get: /api/Data 
//   <br>

//   // Verificacion de datos:
//   Get:/api/Verification  
//    <br>
   

//     `);
//   });

app.use(express.json());

// Inicio del servidor
const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, HOST, () => {
  console.log(`Servidor en http://${HOST}:${PORT}`);
});
