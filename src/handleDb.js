import Product from "./model/Product.js";

export async function saveProduct(product) {
    try {
        
        await Product.create(product);
        //console.log(`Producto guardado en la base de datos: ${product.titulo}`);
    } catch (error) {
        console.error("Error al guardar productos en la base de datos:", error);
    }
}
