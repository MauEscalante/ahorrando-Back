import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import apiRouter from './src/routes/api.js';

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api", apiRouter);

// Conexión MongoDB


// Opciones de MongoDB
const mongooseOptions = {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000
};

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
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


export default app;
