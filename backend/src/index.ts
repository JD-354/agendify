import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Inicialización de la app
const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

// Importación de rutas
import conectDB from "./config/dbMongo";  // Esta es la importación correcta
import rutasUser from "./routes/user.routes";
import rutasEvent from "./routes/event.routes";

const port = process.env.PORT || 4002;

// Conectar a la base de datos
conectDB();

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});

// Rutas
app.use("/api/user", rutasUser);
app.use("/api/event", rutasEvent);
