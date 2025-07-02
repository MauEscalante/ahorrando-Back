import puppeteer from "puppeteer";
import productService from "../services/products.service.js";
import { normalizarPrecio } from "../utils/priceNormalizer.js";

async function scrapProductos(products) {
    try{
        
        for (const product of products) {
            
            // Extraer el título y el precio del producto
            const titulo = await product.$eval(
                '.col-md-prod .product .description span',
                h => h.textContent.trim()
            );
            const precioRaw = await product.$eval(
            '.col-md-prod .product .cajaprecio .price',
            span => span.textContent.trim()
            );
            
            // Normalizar el formato del precio
            const precio = normalizarPrecio(precioRaw);
            
            // Solo procesar productos con precios válidos
            if (!precio) {
                console.warn(`Producto omitido por precio inválido: ${titulo} - ${precioRaw}`);
                continue;
            }
            
        
            await product.scrollIntoViewIfNeeded();

            await product.waitForSelector('img.img-responsive', { timeout: 5000 });
            const imagenURL = await product.$eval(
                '.col-md-prod .product .image img.img-responsive',
                img => img.src
            );
             await productService.putProduct(titulo, precio, imagenURL, "Maximus", "https://www.maximus.com.ar/");
        }
        
    }catch (error) {
        console.error("Error al scrapear productos:", error);
    }
   
}

export async function scrapMaximus() {
    try{
        // Iniciar Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            slowMo:0,
        });

        const page = await browser.newPage();
        await page.goto("https://www.maximus.com.ar/");
        // Esperar a que carguen los paneles
        await page.waitForSelector('.header-bottom-interno');
        await page.click(".hamburger-menu-web")

        const categorias =await page.$$("div.cat-secundaria-interno a.links-cat-secundaria-interno")
        // Itero sobre cada subcategoría y hago clic en ella
        for (let i = 0; i < categorias.length; i++) {
            //obtengo todas las subcategorías
            const subcats = await page.$$("div.cat-secundaria-interno a.links-cat-secundaria-interno")
            const sub = subcats[i];
            const categoria = await sub.evaluate(el => el.textContent.trim());
            //ignorar categorías que no me interesan
            if(["Ver todos los Celulares", "ARMÁ TU PC","Armado de PC a medida","Ver todas las computadoras","Ver todas las notebooks"].includes(categoria)) {
                continue; 
            }
            let link = await sub.evaluate(el => el.href);
            await page.goto(link);

            let hayPaginacion=true;
            while(hayPaginacion){
                const oldUrl = page.url();
               
                let products = await page.$$('.col-md-prod .product');
                if(products.length>0){
                    //scrapear los productos
                    await scrapProductos(products);
                }
                
                const nextButton = await page.$('img[alt="Próximo"]');
                if(nextButton){
                    // Si hay un botón de siguiente, haz clic en él
                    await nextButton.evaluate(el => el.click());

                    const newUrl = page.url();
                    // Verificar si la URL cambió
                    let urlCambio = oldUrl !== newUrl;
                    if(!urlCambio){
                        
                        // Si la URL no cambió, sal del bucle
                        hayPaginacion=false;
                    }else{
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                    
                }else{
                    // Si no hay botón de siguiente, sal del bucle
                    hayPaginacion=false;
                }
                
            }
            
                
        }

    
    // Close the browser
    console.log("Scraping de Maximus completado.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await browser.close();
    }catch (error) {
        console.error("Error al scrapear Maximus:", error);
    }
}
