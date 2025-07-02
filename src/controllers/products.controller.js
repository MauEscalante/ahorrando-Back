import ProductService from '../services/products.service.js';

const putProduct=async (req, res) => {
    try{
        const { titulo, precio, imagen, local, localURL } = req.body;
        await ProductService.putProduct(titulo, precio, imagen, local, localURL);
        res.status(200).json({ message: 'Producto actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        
        const products = await ProductService.getAllProducts(page, limit);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
}

const getProductByTitle = async (req, res) => {
    const { titulo } = req.params;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        
        const products = await ProductService.getProductsByTitle(titulo, page, limit);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        res.status(500).json({ message: 'Error al obtener productos por título' });
    }
}

export default {
    getAllProducts,
    getProductByTitle,
    putProduct
};
