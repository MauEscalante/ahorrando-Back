import express from 'express';
var router = express.Router();
import products from './api/product.route.js';
import users from './api/user.route.js';

router.use('/products', products);
router.use('/users', users);

export default router;
