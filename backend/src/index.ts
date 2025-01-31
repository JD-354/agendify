import express from "express"
import cors from "cors";
import dotenv from "dotenv"


const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//importacion de rutas:
import conectDB from "./config/dbMongo";
import rutasUser from "./routes/user.routes"
import rutasEvent from "./routes/event.routes"

const port = process.env.PORT || 4002;

app.listen(port ,()=>{
  console.log(`servidor corriendo en el puerto ${port}`);
})
app.use("/api/user", rutasUser);
app.use("/api/event",rutasEvent);
conectDB();
