export function normalizarPrecio(precioTexto) {
    // Validación temprana
    if (!precioTexto || precioTexto === '') return null;

    // Convertir a string y limpiar
    const textoLimpio = String(precioTexto).trim();

    // Detectar si tiene decimales (buscar punto o coma seguida de 1-2 dígitos al final)
    const tieneDecimales = /[.,]\d{1,2}$/.test(textoLimpio);

    if (tieneDecimales) {
        // Si tiene decimales, extraer la parte entera (todo excepto los últimos 2-3 caracteres)
        const sinDecimales = textoLimpio.replace(/[.,]\d{1,2}$/, '');
        // Remover todos los caracteres excepto dígitos (eliminar puntos separadores de miles)
        const soloDigitos = sinDecimales.replace(/[^\d]/g, '');

        if (!soloDigitos) return null;

        const numero = Number(soloDigitos);
        // Validar rango
        if (numero <= 0 || numero > 999999999) return null;

        // Formatear para mantener 3 decimales (que representan los miles) y devolver como string
        return numero
    } else {
        // Si no tiene decimales, los puntos son separadores de miles
        const soloDigitos = textoLimpio.replace(/[^\d]/g, '');

        if (!soloDigitos) return null;

        const numero = Number(soloDigitos);

        // Validar rango
        if (numero <= 0 || numero > 999999999) return null;
        // Formatear para mantener 3 decimales (que representan los miles) y devolver como string
        return numero
    }
}

