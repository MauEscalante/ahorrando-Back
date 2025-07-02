import Product from "../model/Product.js";

const putProduct = async (titulo, precio, imagen, local, localURL) => {
    try {
        // Verifica si el producto ya existe por título
        let producto = await Product.findOne({ titulo });
        if(producto) {
            // Si existe, actualiza el precio y agrega al historial
            producto.preciosHistorico.push({ precio, fecha: new Date() });
            producto.precio = precio;
            producto.imagenURL = imagen;
            producto.mes = new Date().getMonth() + 1;
            await producto.save();
        } else {
            // Si no existe, crea un nuevo producto
            producto = new Product({
                titulo,
                precio,
                imagenURL: imagen,
                local: local,
                localURL: localURL,
                fecha: new Date().getMonth() + 1, // Mes actual (1-12)
                precioHistorico: [{ precio, fecha: new Date() }]
            });
            await producto.save();
        }
        return producto;
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        throw error;
    }
}

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

const getProductsByTitle = async (titulo, page = 1, limit = 12) => {
    try {
        // Divide el título en palabras individuales y crea un patrón de búsqueda más flexible
        const palabras = titulo.trim().split(/\s+/);
        
        // Crea un patrón que busque todas las palabras (en cualquier orden)
        const patronesBusqueda = palabras.map(palabra => ({
            titulo: { $regex: palabra, $options: 'i' }
        }));
        
        const skip = (page - 1) * limit;
        
        // Busca productos que contengan TODAS las palabras con paginación
        const products = await Product.find({ 
            $and: patronesBusqueda 
        })
        .skip(skip)
        .limit(limit)
        .sort({ precio: 1 });
        
        return products;
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        throw error;
    }
}

export default {
    putProduct,
    getAllProducts,
    getProductsByTitle
};