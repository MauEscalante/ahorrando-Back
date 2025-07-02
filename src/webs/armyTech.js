import puppeteer from "puppeteer";
import productService from "../services/products.service.js";
import { normalizarPrecio } from "../utils/priceNormalizer.js";

async function scrapProductos(products) {
    try{
         for (const product of products) {
            
            // Extraer el título y el precio del producto
            const titulo = await product.$eval(
            'h3.h3.product-title a',
            h => h.textContent.trim()
            );
            const precioRaw = await product.$eval(
            'span.product-price',
            span => span.textContent.trim()
            );
            
            // Normalizar el formato del precio
            const precio = normalizarPrecio(precioRaw);
            
            // Solo procesar productos con precios válidos
            if (!precio) {
                console.warn(`Producto omitido por precio inválido: ${titulo} - ${precioRaw}`);
                continue;
            }
            
            const existeImagen = await product.$('img.img-fluid.product-thumbnail-first.loaded');

            var imagenURL;
            if (!existeImagen) {
                 imagenURL = null; 
            }else{
                 imagenURL = await product.$eval(
                'img.img-fluid.product-thumbnail-first.loaded',
                img => img.src
            );
            }

             await productService.putProduct(titulo, precio, imagenURL, "Army Tech", "https://www.armytech.com.ar/");
        }
    }catch (error) {
        console.error("Error al scrapear productos:", error);
    }
   
}

export async function scrapArmyTech() {
    const browser = await puppeteer.launch({
    headless: true,
    slowMo:0,
    });
    const page = await browser.newPage();
    await page.goto("https://www.armytech.com.ar/")
    const urls = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('div.elementor-element-owbkaqy div.elementor-widget-image a[href]'));
        return links
            .map(a => a.getAttribute('href'))
            .filter(href => href); // para evitar nulos
    });
    
    for (const url of urls) {
        //recorro las urls designadas
        if (url.includes("/418-placa-de-video")){
            continue;
        }
        await page.goto(`https://www.armytech.com.ar${url}`)
        //espero a que cargue la seccion de productos
        await page.waitForSelector('section#products');
        var hayPaginacion=true
        while(hayPaginacion){
            let products= await page.$$('article.product-miniature.product-miniature-default.product-miniature-grid.product-miniature-layout-1.js-product-miniature');
            if(products.length>0){
                //scrapear los productos
                await scrapProductos(products);
            }
            const nextButton = await page.$('a#infinity-url-next.next.js-search-link');
            if(nextButton){
                // Si hay un botón de siguiente, haz clic en él
                await nextButton.evaluate(el => el.click());
                await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
            }else{
                // Si no hay botón de siguiente, sal del bucle
                hayPaginacion=false;
            }
        }
    }
    

    // Close the browser
    console.log("Scraping de Army Tech completado");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await browser.close();
}
