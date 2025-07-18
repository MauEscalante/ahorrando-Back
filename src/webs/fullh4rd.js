import puppeteer from "puppeteer";
import productService from "../services/products.service.js";
import { normalizarPrecio } from "../utils/priceNormalizer.js";

async function scrapProductos(products) {
    try {
        for (const product of products) {

            // Extraer el título y el precio del producto
            const titulo = await product.$eval(
                'h3',
                h => h.textContent.trim()
            );
            let precio;
            try {
                // Intentar obtener solo el texto directo del div (sin elementos hijos)
                precio = await product.evaluate((element) => {
                    const priceDiv = element.querySelector('div.price');
                    if (priceDiv) {
                        // Obtener solo el texto directo del div, excluyendo los elementos hijos
                        return priceDiv.childNodes[0]?.textContent?.trim() || '';
                    }
                    return null;
                });

                // Si no hay texto directo o está vacío, intentar con el span
                if (!precio || precio === '') {
                    precio = await product.$eval(
                        'div.price span.price-promo',
                        span => span.textContent.trim()
                    );
                }
            } catch (error) {
                continue;
            }

            // Normalizar el formato del precio
            const precioNormalizado = normalizarPrecio(precio);

            // Solo procesar productos con precios válidos
            if (!precioNormalizado) {
                console.warn(`Producto omitido por precio inválido: ${titulo} - ${precio}`);
                continue;
            }

            //scroll para q empiece a cargar la imagen
            await product.scrollIntoViewIfNeeded();


            const existeImagen = await product.$('div.image img');
            var imagenURL;
            if (!existeImagen) {
                imagenURL = null;
            } else {
                imagenURL = await product.$eval(
                    'div.image img',
                    img => img.src
                );
            }
            const url = await product.$eval("a", a => a.href);

            await productService.putProduct(titulo, precioNormalizado, imagenURL, "Full H4rd", url);
        }
    } catch (error) {
        console.error("Error al scrapear productos:", error);
    }

}

export async function scrapFullH4rd() {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo: 0,
    });

    const page = await browser.newPage();
    await page.goto("https://fullh4rd.com.ar/");
    // Esperar a que carguen los paneles
    await page.waitForSelector('div#iconbar');
    const URLs = [
        'https://fullh4rd.com.ar/pcarmada',
        'https://fullh4rd.com.ar/tag/placa%20de%20video',
        'https://fullh4rd.com.ar/cat/supra/1/microprocesador/1',
        'https://fullh4rd.com.ar/tag/hardware',
        'https://fullh4rd.com.ar/cat/supra/12/almacenamiento/1',
        'https://fullh4rd.com.ar/cat/supra/4/memorias/1',
        'https://fullh4rd.com.ar/cat/supra/8/teclados/1',
        'https://fullh4rd.com.ar/cat/supra/14/mouses/1',
        'https://fullh4rd.com.ar/tag/auriculares',
        'https://fullh4rd.com.ar/tag/accesorios',
        'https://fullh4rd.com.ar/tag/streaming',
        'https://fullh4rd.com.ar/cat/supra/32/notebooks/1',
        'https://fullh4rd.com.ar/cat/supra/18/monitores/1',
        'https://fullh4rd.com.ar/cat/supra/2/motherboard/1',
        'https://fullh4rd.com.ar/cat/supra/26/fuentes/1',
        'https://fullh4rd.com.ar/cat/supra/23/refrigeracion/1',
        'https://fullh4rd.com.ar/cat/supra/6/gabinetes/1',
        'https://fullh4rd.com.ar/cat/supra/27/conectividad-y-redes/1'
    ]
    // Obtener todos los elementos de header de paneles

    for (let i = 0; i < URLs.length; i++) {
        await page.goto(URLs[i]);

        let hayPaginacion = true;
        while (hayPaginacion) {
            // Esperar a que carguen los productos
            await page.waitForSelector('div.products');

            // Obtener todos los productos
            const products = await page.$$('div.item.product-xs , div.item.product-list');
            if (products.length > 0) {
                // Scrapea los productos
                await scrapProductos(products);
            }
            const nextButton = await page.$('div.paginator.air div.item a i.fas.fa-chevron-right');
            if (nextButton) {
                await nextButton.click();
                // Si hay un botón de siguiente, haz clic en él
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                // Si no hay botón de siguiente, sal del bucle
                hayPaginacion = false;
            }
        }

    }

    // Close the browser
    console.log("Scraping de Full H4rd finalizado");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await browser.close();
}
