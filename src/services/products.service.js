import Product from "../model/Product.js";

const getAllProducts = async (page = 1, limit = 12) => {
    try {
        const skip = (page - 1) * limit;
        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ _id: -1 }); // Ordenar por más recientes primero
        return products;
    } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        throw error;
    }
}

const getProductsByTitle = async (titulo) => {
    try {
        // Divide el título en palabras individuales y crea un patrón de búsqueda más flexible
        const palabras = titulo.trim().split(/\s+/);
        
        // Crea un patrón que busque todas las palabras (en cualquier orden)
        const patronesBusqueda = palabras.map(palabra => ({
            titulo: { $regex: palabra, $options: 'i' }
        }));
        
        // Busca productos que contengan TODAS las palabras
        const products = await Product.find({ 
            $and: patronesBusqueda 
        }).sort({ precio: 1 });
        
        return products;
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        throw error;
    }
}

export default {
    getAllProducts,
    getProductsByTitle
};