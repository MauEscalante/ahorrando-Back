import express from 'express';
import ProductsController from '../../controllers/products.controller.js';
const router = express.Router();

// Rutas para productos
router.get('/', ProductsController.getAllProducts);
router.get('/:titulo', ProductsController.getProductByTitle);


export default router;
