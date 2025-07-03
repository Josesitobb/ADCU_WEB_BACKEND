// routes/userRoutes.js
import express from 'express';
const router = express.Router();

// Aquí puedes definir tus rutas de usuarios
router.get('/', (req, res) => {
  res.send('Listado de usuarios');
});

export default router;
// Aquí puedes agregar más rutas relacionadas con los usuarios
// como creación de usuarios, actualización de perfil, eliminación de cuenta, etc.