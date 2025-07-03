// routes/authRoutes.js
import express from 'express';
const router = express.Router();

// Aquí van tus rutas de autenticación
// Por ejemplo:
router.post('/signin', (req, res) => {
  res.send('Inicio de sesión');
});

router.post('/signup', (req, res) => {
  res.send('Registro');
});

export default router;
// Aquí puedes agregar más rutas relacionadas con la autenticación
// como restablecimiento de contraseña, verificación de correo electrónico, etc.