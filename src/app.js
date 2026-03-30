import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Bryan Imports funcionando" });
});

app.get("/status", (req, res) => {
  res.json({ mongoState: mongoose.connection.readyState });
});

app.use("/auth", authRoutes);
app.use("/produtos", produtoRoutes);
app.use("/pedidos", pedidoRoutes);
app.use("/usuarios", usuarioRoutes);

export default app;