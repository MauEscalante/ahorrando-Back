import ProductService from '../services/products.service.js';

exports.getAllProducts = async (req, res) => {
    try {
        const products = await ProductService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
}

exports.getProductByTitle = async (req, res) => {
    const { titulo } = req.params;
    try {
        const products = await ProductService.getProductsByTitle(titulo);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        res.status(500).json({ message: 'Error al obtener productos por título' });
    }
}
