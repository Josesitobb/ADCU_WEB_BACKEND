const mongoose = require('mongoose');
const Documento = require('./models/DocumentoComparado'); // ✅ Correcto // Asegúrate que este archivo exista
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const docs = await Documento.find().sort({ createdAt: -1 }).limit(3);
    console.log("🧾 Últimos documentos:", docs);
    process.exit();
  })
  .catch(err => console.error(err));
  // This code connects to a MongoDB database using Mongoose, retrieves the last 3 documents from the "Documento" collection, and logs them to the console.