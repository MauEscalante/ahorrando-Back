import express from 'express';
import userControler from '../../controllers/user.controller.js';
const router = express.Router();
import {authRequired} from '../../middlewares/validateToken.js';

// Rutas para productos
router.post('/register', userControler.register);
router.get('id/:id', userControler.getUserById);
router.get('/:email', userControler.getUserByEmail);

// Rutas para favoritos
router.get('/favoritos', userControler.getFavoritos);
router.put('/favoritos/:id', userControler.addFavorito);
router.delete('/favoritos/:id', userControler.removeFavorito);

// Rutas de autenticación
router.get('/confirm-user/:token', userControler.confirmEmail);
router.post('/login', userControler.login);
router.post('/logout', userControler.logout);
router.get('/me/profile', authRequired, userControler.profile);

export default router;