import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const conectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
};

export default conectDB;
