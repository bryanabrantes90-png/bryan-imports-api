import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI não definida");
    }

    if (mongoose.connection.readyState >= 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(mongoUri);

    console.log("MongoDB conectado com sucesso.");
    return conn;
  } catch (error) {
    console.error("Erro ao conectar no MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;