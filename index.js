import mongoose from 'mongoose';
import 'dotenv/config';
import { scrapCompraGamer } from './src/webs/compraGamer.js';
import { scrapMaximus } from './src/webs/maximus.js';
import { scrapArmyTech } from './src/webs/armyTech.js';
import { scrapVenex } from './src/webs/venex.js';
import { scrapFullH4rd } from './src/webs/fullh4rd.js';

async function main() {
    try {

        // Conexión a MongoDB
        mongoose.connect(process.env.MONGODB_URI)
          .then(() => {
            console.log("MongoDB conectado exitosamente");
          })
          .catch((err) => {
            console.error("Error de conexión a MongoDB:", err.message);
            process.exit(1);
          });
        
        // Manejo de errores de MongoDB
        mongoose.connection.on('error', err => {
          console.error('Error en la conexión de MongoDB:', err.message);
        });
        await scrapCompraGamer();
        await scrapVenex();
        
        await scrapArmyTech();
        
        await scrapMaximus();
        
        
        await scrapFullH4rd();
        console.log("Scraping completado exitosamente");
    } catch (error) {
        console.error('Error al ejecutar el script:', error);
    }
}

main();
