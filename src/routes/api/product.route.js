import express from 'express';
import ProductsController from '../../controllers/products.controller.js';
const router = express.Router();

// Rutas para productos
router.get('/', ProductsController.getAllProducts);
router.get('/:id', ProductsController.getProductById);
router.get('/:titulo', ProductsController.getProductByTitle);
router.get('/detalles/:id', ProductsController.getDetailsById);


export default router;
