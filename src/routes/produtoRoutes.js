import express from "express";
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  deletarProduto,
  listarProdutos
} from "../controllers/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", listarProdutos);
router.get("/:id", buscarProdutoPorId);

router.post("/", authMiddleware, adminMiddleware, criarProduto);
router.put("/:id", authMiddleware, adminMiddleware, atualizarProduto);
router.delete("/:id", authMiddleware, adminMiddleware, deletarProduto);

export default router;