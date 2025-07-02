import express from 'express';
var router = express.Router();
import products from './api/product.route.js';

router.use('/products', products);

export default router;
