import { Router } from "express";
import {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto
} from "../controllers/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = Router();

router.get("/", listarProdutos);
router.get("/:id", buscarProdutoPorId);

router.post("/", authMiddleware, adminMiddleware, upload.single("imagem"), criarProduto);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("imagem"), atualizarProduto);
router.delete("/:id", authMiddleware, adminMiddleware, deletarProduto);

export default router;