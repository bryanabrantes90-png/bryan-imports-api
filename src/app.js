import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import pedidoRoutes from "./routes/pedidoRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/auth", authRoutes);
app.use("/produtos", produtoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/pedidos", pedidoRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

export default app;