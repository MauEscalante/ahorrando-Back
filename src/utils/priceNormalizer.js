
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
        // Extraer solo los dígitos de la parte entera
        const soloDigitos = sinDecimales.replace(/[^\d]/g, '');
        
        if (!soloDigitos) return null;
        
        const numero = parseInt(soloDigitos, 10);
        
        // Validar rango
        if (numero <= 0 || numero > 999999999) return null;
        
        // Formatear automáticamente con separadores de miles
        return `$${numero.toLocaleString('es-AR')}`;
    } else {
        // Si no tiene decimales, procesar como antes
        const soloDigitos = textoLimpio.replace(/[^\d]/g, '');
        
        if (!soloDigitos) return null;
        
        const numero = parseInt(soloDigitos, 10);
        
        // Validar rango
        if (numero <= 0 || numero > 999999999) return null;
        
        // Formatear automáticamente con separadores de miles
        return `$${numero.toLocaleString('es-AR')}`;
    }
}


export function precioANumero(precioNormalizado) {
    if (!precioNormalizado || typeof precioNormalizado !== 'string') return 0;
    
    // Remover símbolo $ y puntos separadores, mantener solo dígitos
    const numeroString = precioNormalizado.replace(/[^0-9]/g, '');
    
    return parseInt(numeroString, 10) || 0;
}