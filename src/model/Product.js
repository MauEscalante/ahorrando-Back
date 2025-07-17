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
  // Validar entrada
  if (!año || !mes || mes < 1 || mes > 12) {
    return null;
  }

  // Crear fechas límite del mes
  const fechaInicio = new Date(año, mes - 1, 1); // mes - 1 porque Date usa 0-11
  const fechaFin = new Date(año, mes, 0, 23, 59, 59, 999); // Último día del mes

  // Tomar solo los últimos 120 precios históricos (máximo 4 por día)
  const ultimosPrecios = this.preciosHistorico.slice(-120);

  // Filtrar precios del mes específico sobre ese subconjunto
  const preciosDelMes = ultimosPrecios.filter(item => {
    const fecha = item.fecha;
    return fecha >= fechaInicio && fecha <= fechaFin;
  });

  // Si no hay datos para ese mes, retornar null
  if (preciosDelMes.length === 0) {
    return null;
  }

  // Calcular promedio de manera eficiente
  const suma = preciosDelMes.reduce((acc, item) => acc + item.precio, 0);
  const promedio = suma / preciosDelMes.length;

  // Actualizar el array de promedios para el año
  const añoStr = año.toString();
  let promediosAño = this.promediosPorAño.get(añoStr) || new Array(12).fill(null);
  
  // Actualizar el promedio del mes (mes - 1 porque el array es 0-indexed)
  promediosAño[mes - 1] = Math.round(promedio * 100) / 100; // Redondear a 2 decimales
  
  // Guardar en el Map
  this.promediosPorAño.set(añoStr, promediosAño);

  return promediosAño[mes - 1];
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
    const mes = doc.fecha.getMonth() + 1; // +1 porque getMonth() retorna 0-11

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
      return true; // Indica que se actualizó correctamente
    }

    next();
    return false; // No hubo actualización
  } catch (error) {
    console.error('❌ Error en post save:', error);
    next(error);
    return false;
  }
});

export default model("Product", productSchema);