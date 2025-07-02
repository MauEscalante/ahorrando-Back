import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    precio: {
      type: String,
      required: true,
    },
    imagenURL: {
      type: String,
      required: false,
    },
    local: {
      type: String,
      required: true,
    },
    localURL: {
      type: String,
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    preciosHistorico: [
      {
        precio: {
          type: String,
          required: true,
        },
        fecha: { 
          type: Date,
          required: true,
        },
      },
    ],
    // Map: clave = año (ej: "2025"), valor = array de 12 promedios mensuales
    promediosPorAño: {
      type: Map,
      of: [Number], // Array de 12 números (uno por mes)
      default: new Map()
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Método para recalcular promedio de un mes específico
productSchema.methods.recalcularPromedioMes = function(año, mes) {
  // Recopilar todos los precios de ese año-mes SOLO del historial
  let preciosDelMes = [];
  
  // Recorrer desde el final del array (más eficiente si los últimos son del mes actual)
  for (let i = this.preciosHistorico.length - 1; i >= 0; i--) {
    const item = this.preciosHistorico[i];
    const itemAño = item.fecha.getFullYear();
    const itemMes = item.fecha.getMonth() + 1;
    
    if (itemAño === año && itemMes === mes) {
      const precioHistorico = parseFloat(item.precio.replace(/[^\d.-]/g, ''));
      if (!isNaN(precioHistorico)) {
        preciosDelMes.push(precioHistorico);
      }
    } else if (itemAño < año || (itemAño === año && itemMes < mes)) {
      // Si llegamos a un mes/año anterior, podemos parar
      break;
    }
  }

  // Calcular promedio si hay precios
  if (preciosDelMes.length > 0) {
    const promedio = preciosDelMes.reduce((sum, precio) => sum + precio, 0) / preciosDelMes.length;
    
    // Obtener o crear el array de promedios para ese año
    const añoStr = año.toString();
    let promediosAño = this.promediosPorAño.get(añoStr) || new Array(12).fill(0);
    
    // Actualizar el mes específico (mes-1 porque los arrays empiezan en 0)
    promediosAño[mes - 1] = Math.round(promedio * 100) / 100;
    
    // Guardar en el Map
    this.promediosPorAño.set(añoStr, promediosAño);
    
    return promedio;
  }
  
  return 0;
};

// Middleware que se ejecuta DESPUÉS de guardar (post save)
productSchema.post('save', function(doc, next) {
  try {
    const año = doc.fecha.getFullYear();
    const mes = doc.fecha.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
    
    // Recalcular promedio para ese mes
    doc.recalcularPromedioMes(año, mes);
    
    next();
  } catch (error) {
    next(error);
  }
});

export default model("Product", productSchema);