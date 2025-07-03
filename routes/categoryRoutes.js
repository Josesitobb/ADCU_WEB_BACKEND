// routes/categoryRoutes.js
import express from 'express';
const router = express.Router();

// Ruta de ejemplo
router.get('/', (req, res) => {
  res.send('Categorías');
});

export default router;
// Aquí puedes agregar más rutas relacionadas con las categorías
// como creación de categorías, actualización de categorías, eliminación de categorías, etc.
