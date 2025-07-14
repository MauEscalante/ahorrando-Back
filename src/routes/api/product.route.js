import express from 'express';
import ProductsController from '../../controllers/products.controller.js';
const router = express.Router();

// Rutas para productos (orden específico para evitar conflictos)
router.get('/detalles/:id', ProductsController.getDetailsById);
router.get('/id/:id', ProductsController.getProductById);
router.get('/title/:titulo', ProductsController.getProductByTitle);
router.get('/search/:id', ProductsController.getPromediosById);


export default router;
