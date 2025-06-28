import Product from "../model/Product";

exports.getAllProducts = async () => {
    try {
        const products = await Product.find();
        return products;
    } catch (error) {
        console.error('Error al obtener todos los productos:', error);
        throw error;
    }
}

exports.getProductsByTitle = async (titulo) => {
    try {
        // busca productos por título de manera insensible a mayúsculas y minúsculas ordenados de menor a mayor precio
        const products = await Product.find({ titulo: { $regex: titulo, $options: 'i' } }).sort({ precio: 1 });
        return products;
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        throw error;
    }
}