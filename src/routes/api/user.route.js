import express from 'express';
import userControler from '../../controllers/user.controller.js';
const router = express.Router();
import {authRequired} from '../../middlewares/validateToken.js';

// Rutas para productos
router.post('/register', userControler.register);

// Rutas para favoritos
router.get('/list/favoritos', authRequired, userControler.getFavoritos);
router.put('/favoritos/:productId', authRequired, userControler.addFavorito);
router.delete('/favoritos/:productId', authRequired, userControler.removeFavorito);

// Rutas de autenticación
router.get('/confirm-user/:token', userControler.confirmEmail);
router.post('/login', userControler.login);
router.post('/logout', authRequired, userControler.logout);
router.get('/me/profile', authRequired, userControler.profile);
router.get('/me/logged',  userControler.logged);

export default router;