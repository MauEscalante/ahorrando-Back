import { get } from 'mongoose';
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

const getProductById = async (req, res) => {
    try{
        const {id}=req.params;  
        const product = await ProductService.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    }catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ message: 'Error al obtener producto por ID' });
    }
}

const getDetailsById = async (req, res) => {
    try{
        const { id } = req.params;
        const {año, mes} = req.body;
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

export default {
    getAllProducts,
    getProductByTitle,
    putProduct,
    getProductById,
    getDetailsById
};
