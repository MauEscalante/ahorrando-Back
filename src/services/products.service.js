import { get } from "mongoose";
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
            producto.fecha = new Date();
            await producto.save();
        } else {
            // Si no existe, crea un nuevo producto
            producto = new Product({
                titulo,
                precio,
                imagenURL: imagen,
                local: local,
                localURL: localURL,
                fecha: new Date(),
                preciosHistorico: [{ precio, fecha: new Date() }]
            });
            await producto.save();
        }
        return producto;
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        throw error;
    }
}



const getProductsByTitle = async (titulo, page, limit) => {
    try {
        const skip = (page - 1) * limit;
        // Divide el título en palabras individuales y crea un patrón de búsqueda más flexible
        let palabras = [titulo.trim(), ...titulo.trim().split(/\s+/)];
        // Crea un patrón que busque todas las palabras (en cualquier orden)
        const patronesBusqueda = palabras.map(palabra => ({
            titulo: { $regex: palabra, $options: 'i' }
        }));

        // Busca productos que contengan TODAS las palabras
        const products = await Product.find({
            $and: patronesBusqueda
        })
        .sort({ precio: 1 })
        .skip(skip)
        .limit(limit);
        
        return products;
    } catch (error) {
        console.error('Error al obtener productos por título:', error);
        throw error;
    }
}

const getPromediosById = async (id) => {
    try {
        const product = await Product.findById(id);
        const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        const resultado = [];

        for (const [año, precios] of product.promediosPorAño.entries()) {
            precios.forEach((precio, i) => {
                resultado.push({
                año,
                mes: meses[i],
                precio: precio
                });
            });
        }
        return resultado;

    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        throw error;
    }
}

const getDetailsById = async (id, año, mes) => {
    try{
        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        let intMes;
        for (let i = 0; i < meses.length; i++) {
            if (meses[i] === mes) {
                intMes = i + 1; // getMonth() devuelve 0-11, necesitamos 1-12
                break;
            }
        }

        // Si se proporcionan año y mes, filtrar por esos valores
        if (año && mes) {
            const preciosFiltrados = product.preciosHistorico.filter(item => {
                const itemAño = item.fecha.getFullYear();
                const itemMes = item.fecha.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
                
                return itemAño === parseInt(año) && itemMes === parseInt(intMes);
            });
            
            return preciosFiltrados;
        }

        // Si no se proporcionan filtros, devolver todo el historial
        return product.preciosHistorico;
    } catch (error) {
        console.error('Error al obtener detalles por ID:', error);
        throw error;
    }
}

const getProductById = async (id) => {
    try {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        } 
        return product;
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        throw error;
    }
}

export default {
    putProduct,
    getProductsByTitle,
    getPromediosById,
    getDetailsById,
    getProductById
};