import puppeteer from "puppeteer";
import {putProduct} from "../controllers/products.controller.js";

async function scrapProductos(products) {
    try{
            for (const product of products) {
                const stock= await product.$(".label.label-no-stock")
                if(stock){
                    return false
                }

                // Extraer el título y el precio del producto
                const titulo = await product.$eval(
                'h3.product-box-title',
                h => h.textContent.trim()
                );
                const precio = await product.$eval(
                'span.current-price',
                span => span.textContent.trim()
                );
                //scroll para q empiece a cargar la imagen
                await product.scrollIntoViewIfNeeded();

                
                const existeImagen = await product.$('img.img-contained');
                var imagenURL;
                if (!existeImagen) {
                    imagenURL = null; 
                }else{
                    imagenURL = await product.$eval(
                    'img.img-contained',
                    img => img.src
                );
                }

               await putProduct({
                titulo,
                precio,
                imagen: imagenURL,
                local: "Venex",
                localURL: "https://www.venex.com.ar/",
            });
            }
        return true
    }catch (error) {
        console.error("Error al scrapear productos:", error);
    }
   
}

export async function scrapVenex() {
    const browser = await puppeteer.launch({
        headless: true,
        slowMo:0,
    });
    const URLs=[
        "https://www.venex.com.ar/componentes-de-pc",
        "https://www.venex.com.ar/pc-de-escritorio",
        "https://www.venex.com.ar/notebooks",
        "https://www.venex.com.ar/monitores",
        "https://www.venex.com.ar/perifericos",
        "https://www.venex.com.ar/conectividad-y-redes",
        "https://www.venex.com.ar/impresion-y-scanners",
        "https://www.venex.com.ar/relojes-smartwatch",
        "https://www.venex.com.ar/almacenamiento-portatil",
        "https://www.venex.com.ar/tablets",
        "https://www.venex.com.ar/tablets-digitalizadoras",
        "https://www.venex.com.ar/televisores-y-tv-box",
        "https://www.venex.com.ar/streaming",
        "https://www.venex.com.ar/software",
        "https://www.venex.com.ar/soportes",
        "https://www.venex.com.ar/sillas-gamers",
        "https://www.venex.com.ar/estabilizadores-ups-y-zapatillas"
    ]

    const page = await browser.newPage();    
    // Obtener todos los elementos de header de paneles
    for (let i = 0; i < URLs.length; i++) {
        await page.goto(URLs[i]);
        
        let hayPaginacion=true
        while(hayPaginacion){
            await page.waitForSelector('div.row');
            const products = await page.$$('.product-box');
            if (products.length > 0) {
                const resultados = await scrapProductos(products);
                if(!resultados){
                    console.log("BREAK")
                    break;
                }
                
            }
            const nextButton = await page.$('ul.pagination a.pageResults i.fa.fa-chevron-right');
            if(nextButton){
                // Si hay un botón de siguiente, haz clic en él
                await nextButton.click();
            }else{
                // Si no hay botón de siguiente, sal del bucle
                hayPaginacion=false;
            }
        }
        

    }



  
  // Close the browser
  console.log("Scraping de Venex exitoso");
  await new Promise(resolve => setTimeout(resolve, 1000));
  await browser.close();
}
