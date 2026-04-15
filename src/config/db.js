import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não definida");
    }

    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongo conectado");
  } catch (error) {
    console.error("Erro Mongo:", error.message);
    throw error;
  }
};

export default connectDB;