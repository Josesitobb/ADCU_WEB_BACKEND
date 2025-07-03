// routes/subcategoryRoutes.js
import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Subcategorías');
});

export default router;
// Aquí puedes agregar más rutas relacionadas con las subcategorías
// como creación de subcategorías, actualización de subcategorías, eliminación de subcategorías
// y cualquier otra funcionalidad específica que necesites para las subcategorías.
// Por ejemplo, podrías agregar rutas para obtener subcategorías por ID, listar subcategorías por categoría, etc.