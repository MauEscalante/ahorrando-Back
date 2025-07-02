import puppeteer from "puppeteer";
import productService from "../services/products.service.js";
import { normalizarPrecio } from "../utils/priceNormalizer.js";

async function scrapProductos(products) {
    try{
         for (const product of products) {
            // Extraer el título y el precio del producto
            const titulo = await product.$eval(
            'h3.cg__fw-400.mb-5.product-card__title.ng-star-inserted',
            h => h.textContent.trim()
            );
            const precioRaw = await product.$eval(
            'span.txt_price',
            span => span.textContent.trim()
            );
            
            // Normalizar el formato del precio
            const precio = normalizarPrecio(precioRaw);
            
            // Solo procesar productos con precios válidos
            if (!precio) {
                console.warn(`Producto omitido por precio inválido: ${titulo} - ${precioRaw}`);
                continue;
            }
            //scroll para q empiece a cargar la imagen
            await product.scrollIntoViewIfNeeded();

            // Espera a que la imagen se cargue
            await product.waitForSelector('img.ng-lazyloaded', { timeout: 500 }).catch(() =>
                console.log(`No se encontro foto`)
            );
        
            const imagenURL = await product.$eval(
                'img.ng-lazyloaded',
                img => img.src
            );

             await productService.putProduct(titulo, precio, imagenURL, "Compra gamer", "https://compragamer.com/");
        }
    }catch (error) {
        console.error("Error al scrapear productos:", error);
    }
   
}

export async function scrapCompraGamer() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo:0,
  });

  const page = await browser.newPage();
  await page.goto("https://compragamer.com/productos");
  // Esperar a que carguen los paneles
  await page.waitForSelector('mat-expansion-panel-header');

  // Obtener todos los elementos de header de paneles
  const subcategorias =await page.$$('.categoriesPanel .mat-expansion-panel-body p.sub.ng-star-inserted');

// Itero sobre cada subcategoría y hago clic en ella
  for (let i = 0; i < subcategorias.length; i++) {
    const subcats = await page.$$('.categoriesPanel .mat-expansion-panel-body p.sub.ng-star-inserted');
    const sub = subcats[i];
    const categoria = await sub.evaluate(el => el.textContent.trim());

    await sub.evaluate(el => el.click());

     // Esperás a que cambie el contenido de la nueva vista
    await page.waitForSelector('.cg__primary-card', { timeout: 300 }).catch(() =>
        console.log(`No se encontraron productos para: ${categoria}`)
    );
    // Obtener los productos de la subcategoría
    const productos = await page.$$('.cg__primary-card');
 
    const resultados = await scrapProductos(productos);
}

  
  // Close the browser
  console.log("Scraping de Compra Gamer finalizado");
  await new Promise(resolve => setTimeout(resolve, 1000));
  await browser.close();
}
