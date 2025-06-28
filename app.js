const express = require('express');
const cors = require('cors');
import { MONGODB_URI } from "./config.js";
import apiRouter from './routes/api.js'; // Asegúrate de que la ruta sea correcta

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS para permitir solicitudes desde cualquier origen
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, Origin, X-Requested-With, Content-Type, Accept, x-access-token"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api", apiRouter);

// Conexión MongoDB
const mongoose = require("mongoose");

// Opciones de MongoDB
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  ssl: true
};

// Conexión a MongoDB
mongoose
  .connect(MONGODB_URI, mongooseOptions)
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

// Puerto del servidor
const port = process.env.PORT || 4000;

// Iniciar servidor
const server = app.listen(port, () => {
  console.log(`Servidor iniciado en puerto ${port}`);
});


module.exports = app;
