import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    titulo: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
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
          type: Number,
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
      of: [Schema.Types.Number], // Array de strings que representan los promedios mensuales
      default: new Map()
    },
    favoritedBy: [{
      email: {
        type: String,
        required: true,
      },
      precioUltimaAlerta: {
        type: Number
      },
      ultimaAlerta: {
        type: Date
      }
    }]
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Crear índice de texto para búsqueda eficiente
productSchema.index({ titulo: "text" });

// Método para recalcular promedio de un mes específico
productSchema.methods.recalcularPromedioMes = function (año, mes) {

  let sumaTotal = 0;
  let cantidadPrecios = 0;
  const ultimosPrecios = this.preciosHistorico.slice(-90); // Tomar los últimos 90 precios del historial

  //aseguramos de tener los precios del mes
  for (const datoHist of ultimosPrecios) {
    if (datoHist.fecha.getFullYear() === año && datoHist.fecha.getMonth() + 1 === mes) {
      sumaTotal += datoHist.precio;
      cantidadPrecios++;
    }
  }

  if (cantidadPrecios > 0) {
    return sumaTotal / cantidadPrecios;
  }

  return null;
};

//obtener para verificar si enviar notificacion
productSchema.methods.verificarBajaPrecio = function (precio) {
  //tomo los ultimos 90 precios del historial
  const ultimosPrecios = this.preciosHistorico.slice(-90);
  let total = 0;
  let sumaPesos = 0

  // Verificar si el producto tiene alertas configuradas
  if (this.favoritedBy && this.favoritedBy.length > 0) {
    for (let i = 0; i < ultimosPrecios.length; i++) {
      let peso;
      if (i <= 60) {
        peso = 1; // Peso normal para los primeros 60 precios
      } else {
        peso = 3; // Peso triple para los últimos 30 precios
      }
      total += ultimosPrecios[i].precio * peso;
      sumaPesos += peso;

    }
    return total / sumaPesos;
  }
  return null;
}


// Middleware que se ejecuta DESPUÉS de guardar (post save)
productSchema.post('save', async function (doc, next) {
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