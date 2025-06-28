import "./src/database.js";
import { scrapCompraGamer } from './src/webs/compraGamer.js';
import { scrapMaximus } from './src/webs/maximus.js';
import { scrapArmyTech } from './src/webs/armyTech.js';
import { scrapVenex } from './src/webs/Venex.js';
import { scrapFullH4rd } from './src/webs/fullh4rd.js';

async function main() {
    try {
        await scrapArmyTech();
        await scrapCompraGamer();
        await scrapMaximus();
        
        await scrapVenex();
        await scrapFullH4rd();
    } catch (error) {
        console.error('Error al ejecutar el script:', error);
    }
}

main();
