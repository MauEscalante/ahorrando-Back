# 🔧 Hardware Scraper - Backend API

## 📋 Descripción

Backend Node.js que recolecta precios de productos de hardware de múltiples tiendas argentinas y expone una API REST para consultar la información.

## 🚀 Inicio Rápido

```bash
npm install
npm run dev
```

## 📊 Estructura del Proyecto

```
src/
├── controllers/          # Controladores de la API
│   └── products.controller.js
├── model/               # Modelos de MongoDB
│   └── Product.js
├── routes/              # Definición de rutas
│   ├── api.js
│   └── api/
│       └── posts.route.js
├── services/            # Lógica de negocio
│   └── products.service.js
├── utils/               # Utilidades
│   └── priceNormalizer.js
└── webs/                # Scrapers por tienda
    ├── armyTech.js
    ├── compraGamer.js
    ├── fullh4rd.js
    ├── maximus.js
    └── venex.js
```

## 🛠️ API Endpoints

### Productos

#### GET `/api/products`
Obtiene todos los productos con paginación.

**Parámetros de consulta:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Productos por página (default: 12)

**Ejemplo:**
```http
GET /api/products?page=1&limit=12
```

#### GET `/api/products/:titulo`
Busca productos por título.

**Parámetros:**
- `titulo`: Término de búsqueda

**Ejemplo:**
```http
GET /api/products/rtx%204070
```

#### PUT `/api/products`
Actualiza un producto existente.

**Body:**
```json
{
  "titulo": "Placa de Video RTX 4070",
  "precio": "$850.000",
  "imagen": "https://...",
  "local": "CompraGamer",
  "localURL": "https://compragamer.com"
}
```

## 🗄️ Modelo de Datos

### Product Schema
```javascript
{
  titulo: {
    type: String,
    required: true
  },
  precio: {
    type: String,
    required: true
  },
  imagenURL: {
    type: String,
    required: false
  },
  local: {
    type: String,
    required: true
  },
  localURL: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  preciosHistorico: [{
    precio: String,
    fecha: Date
  }],
  linkProducto: String
}
```

## 🕷️ Web Scrapers

### Tiendas Soportadas

1. **Army Tech** (`armyTech.js`)
2. **CompraGamer** (`compraGamer.js`)
3. **FullH4rd** (`fullh4rd.js`)
4. **Maximus** (`maximus.js`)
5. **Venex** (`venex.js`)



## 💰 Normalización de Precios

La función `normalizarPrecio()` en `utils/priceNormalizer.js` maneja:

- ✅ Eliminación de decimales argentinos
- ✅ Formateo con separadores de miles
- ✅ Validación de rangos
- ✅ Conversión de formatos diversos

**Ejemplos:**
```javascript
normalizarPrecio("$ 89.426.24") // → "$89.426"
normalizarPrecio("150000")       // → "$150.000"
normalizarPrecio("$1.234,50")    // → "$1.234"
```

## 🔧 Configuración

### Variables de Entorno (.env)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/scrapper
```

### Dependencias Principales
- **express**: Framework web
- **mongoose**: ODM para MongoDB
- **puppeteer**: Web scraping
- **cors**: Cross-origin requests
- **dotenv**: Variables de entorno

## 🚦 Scripts NPM

```bash
npm run dev     # Desarrollo con nodemon
npm start       # Producción
```
