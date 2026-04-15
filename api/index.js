import app from "../src/app.js";
import connectDB from "../src/config/db.js";

let isConnected = false;

export default async function handler(req, res) {
  try {
    if (!isConnected) {
      await connectDB();
      isConnected = true;
      console.log("Banco conectado na Vercel.");
    }

    return app(req, res);
  } catch (error) {
    console.error("Erro na function da Vercel:", error);
    return res.status(500).json({
      message: "Erro interno do servidor",
      error: error.message
    });
  }
}