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
      of: [Schema.Types.Mixed], // Array mixto que puede contener strings o números
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
  
  // Recorrer todo el array para encontrar precios del mes específico
  for (let i = 0; i < this.preciosHistorico.length; i++) {
    const item = this.preciosHistorico[i];
    const itemAño = item.fecha.getFullYear();
    const itemMes = item.fecha.getMonth() + 1;
    
    if (itemAño === año && itemMes === mes) {
      // Mantener el precio en el formato original (string)
      preciosDelMes.push(item.precio);
    }
  }

  // Calcular promedio si hay precios (incluso si es solo uno)
  if (preciosDelMes.length > 0) {
    // Si solo hay un precio, usar ese mismo valor
    let promedioFinal;
    if (preciosDelMes.length === 1) {
      promedioFinal = preciosDelMes[0]; // Mantener formato string original
    } else {
      // Si hay múltiples precios, calcular promedio numérico y convertir a string
      const preciosNumericos = preciosDelMes.map(precio => {
        if (typeof precio === 'string') {
          return parseFloat(precio.replace(/[^\d.-]/g, ''));
        }
        return parseFloat(precio);
      }).filter(precio => !isNaN(precio) && precio > 0);
      
      if (preciosNumericos.length > 0) {
        const promedioNumerico = preciosNumericos.reduce((sum, precio) => sum + precio, 0) / preciosNumericos.length;
        promedioFinal = Math.round(promedioNumerico * 100) / 100; // Convertir a número redondeado
      } else {
        promedioFinal = preciosDelMes[0]; // Fallback al primer precio
      }
    }
    
    // Obtener o crear el array de promedios para ese año
    const añoStr = año.toString();
    let promediosAño = this.promediosPorAño.get(añoStr) || new Array(12).fill(null);
    
    // Actualizar el mes específico (mes-1 porque los arrays empiezan en 0)
    promediosAño[mes - 1] = promedioFinal;
    
    // Guardar en el Map
    this.promediosPorAño.set(añoStr, promediosAño);
    
    return promedioFinal;
  }
  
  return null;
};

// Middleware que se ejecuta DESPUÉS de guardar (post save)
productSchema.post('save', async function(doc, next) {
  try {
    const año = doc.fecha.getFullYear();
    const mes = doc.fecha.getMonth() + 1;
    
    // Recalcular promedio para ese mes
    const promedio = doc.recalcularPromedioMes(año, mes);
    
    // Solo actualizar si se calculó un promedio
    if (promedio !== null && promedio !== undefined) {
      // Usar findByIdAndUpdate que no ejecuta middleware de save
      await doc.constructor.findByIdAndUpdate(
        doc._id,
        { $set: { promediosPorAño: doc.promediosPorAño } },
        { new: false } // No necesitamos el documento actualizado
      );
    }
    
    next();
  } catch (error) {
    console.error('❌ Error en post save:', error);
    next(error);
  }
});

export default model("Product", productSchema);