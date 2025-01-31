import mongoose from "mongoose";

const url:string = String(process.env.URL_BDMONGO);


const conectDB= async() : Promise<void>=>{
 try {
    await mongoose.connect(url);
   return console.log("Conectado a la base de datos");
 } catch (error) {
    console.error("error:",error);
    process.exit(1);
 }
}
export default conectDB;