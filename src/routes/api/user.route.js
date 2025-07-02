import express from 'express';
import userControler from '../../controllers/user.controller.js';
const router = express.Router();

// Rutas para productos
router.put('/register', userControler.register);
router.get('/:id', userControler.getUserById);
router.get('/:email', userControler.getUserByEmail);
router.get('/favoritos', userControler.getFavoritos);
router.put('/favoritos/:id', userControler.addFavorito);
router.delete('/favoritos/:id', userControler.removeFavorito);
router.put('/confirm/:token', userControler.confirmEmail);
router.put('/login', userControler.login);

export default router;