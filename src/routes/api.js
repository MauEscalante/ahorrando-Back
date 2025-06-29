import express from 'express';
var router = express.Router();
import products from './api/posts.route.js';

router.use('/products', products);

export default router;
