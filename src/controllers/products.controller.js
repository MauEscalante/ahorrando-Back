
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



const getProductByTitle = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const { titulo } = req.params;
    try {
        const products = await ProductService.getProductsByTitle(titulo, page, 12);
        res.status(200).json(products);
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        res.status(500).json({ message: 'Error al obtener productos por título' });
    }
}

const getPromediosById = async (req, res) => {
    try{
        const {id}=req.params;  
        const product = await ProductService.getPromediosById(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    }catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error al obtener producto por ID' });
    }
}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getProductById(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        res.status(200).json(product);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error al obtener producto por ID' });
    }
}

const getDetailsById = async (req, res) => {
    try{
        const { id } = req.params;
        const { año, mes } = req.query; // Cambiado de req.body a req.query
        const details = await ProductService.getDetailsById(id, año, mes);

        if (!details) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.status(200).json(details);
    }catch (error) {
        console.error('Error al obtener detalles por ID:', error);
        res.status(500).json({ message: 'Error al obtener detalles por ID' });
    }
}

const scrapeProducts = async (req, res) => {
    try {
        await ProductService.scrapeProducts();
        res.status(200).json({ message: 'Scraping de productos completado' });
    } catch (error) {
        console.error('Error al realizar scraping de productos:', error);
        res.status(500).json({ message: 'Error al realizar scraping de productos' });
    }
}

export default {
    scrapeProducts,
    getProductByTitle,
    putProduct,
    getPromediosById,
    getDetailsById,
    getProductById
};
