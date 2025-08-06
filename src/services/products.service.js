import Product from "../model/Product.js";
import { scrapCompraGamer } from '../webs/compraGamer.js';
import { scrapMaximus } from '../webs/maximus.js';
import { scrapArmyTech } from '../webs/armyTech.js';
import { scrapVenex } from '../webs/venex.js';
import { scrapFullH4rd } from '../webs/fullh4rd.js';

const putProduct = async (titulo, precio, imagen, local, localURL) => {
    try {
        // Verifica si el producto ya existe por título
        let producto = await Product.findOne({ titulo });
        if (producto) {
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
        const promedio = producto.verificarBajaPrecio();
        // Si el precio actual es un 5% menor que el promedio
        if (producto.precio < promedio * 0.95) {
            const subject = `Alerta de precio bajo - ${producto.titulo}`;
            const html = `
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirm Your Account</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                      }
                      .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                      }
                      .header {
                        background-color:rgb(50, 123, 255);
                        color: #ffffff;
                        text-align: center;
                        padding: 20px;
                      }
                      .header h1 {
                        margin: 0;
                        font-size: 24px;
                      }
                      .content {
                        padding: 20px;
                        line-height: 1.6;
                        color: #333333;
                      }
                      .content p {
                        margin: 10px 0;
                      }
                      .btn {
                        display: inline-block;
                        background-color:rgb(50, 123, 255);
                        color: #ffffff;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        margin-top: 20px;
                        font-size: 16px;
                      }
                      .btn:hover {
                        background-color:rgb(0, 153, 255);
                      }
                      .footer {
                        text-align: center;
                        padding: 10px;
                        font-size: 12px;
                        color: #777777;
                        background-color: #f4f4f4;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <div class="header">
                        <h1>El producto esta mas bajo que nunca</h1>
                      </div>
                      <div class="content">
                        <p>El producto <strong>${producto.titulo}</strong> ha bajado de precio. Aprovecha y compra ahora!</p>
                        <a href="${producto.localURL}" class="btn">Ver producto</a>
                      </div>
                      <div class="footer">
                        <p>Este correo fue enviado desde Ahorrando.</p>
                      </div>
                    </div>
                  </body>
                  </html>
                `;
            for (const favoritoBy of producto.favoritedBy) {
                await userService.sendConfirmationEmail({ email: favoritoBy.email, subject, html });
                //actualizar ultima alerta
                await actualizarUltimaAlerta(producto._id, favoritoBy.email, precio)
            }
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
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];

        // Verificar si existe el map promediosPorAño
        if (!product.promediosPorAño || product.promediosPorAño.size === 0) {
            return [];
        }

        // Obtener el último año (clave más alta)
        const años = Array.from(product.promediosPorAño.keys()).map(key => parseInt(key));
        const ultimoAño = Math.max(...años);

        // Obtener el array de promedios del último año
        const promediosUltimoAño = product.promediosPorAño.get(ultimoAño.toString());

        // Crear el array resultado con cada mes y su promedio
        const resultado = promediosUltimoAño.map((promedio, index) => ({
            año: ultimoAño,
            mes: meses[index],
            precio: promedio
        })).filter(item => item.precio !== null && item.precio !== undefined);

        return resultado;

    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        throw error;
    }
}

const getDetailsById = async (id, año, mes) => {
    try {
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

const actualizarUltimaAlerta = async (productId, email, nuevoPrecio) => {
    await Product.updateOne(
        {
            _id: productId,
            "favoritedBy.email": email
        },
        {
            $set: {
                "favoritedBy.$.ultimaAlerta": new Date(),
                "favoritedBy.$.precioUltimaAlerta": nuevoPrecio
            }
        }
    );
};

const scrapeProducts = async (req, res) => {
    try {
        await scrapCompraGamer();
        await scrapVenex();
        await scrapArmyTech();
        await scrapMaximus();
        await scrapFullH4rd();

        return {success: true, message: 'Scraping completado exitosamente'};
    } catch (error) {
        throw error;
    }
}

export default {
    scrapeProducts,
    putProduct,
    getProductsByTitle,
    getPromediosById,
    getDetailsById,
    getProductById,
    actualizarUltimaAlerta
};