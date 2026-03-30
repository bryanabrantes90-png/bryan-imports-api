import { Router } from "express";
import {
  listarProdutos,
  criarProduto,
  deletarProduto,
  avaliarProduto
} from "../controllers/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.get("/", listarProdutos);
router.post("/", authMiddleware, adminMiddleware, criarProduto);
router.delete("/:id", authMiddleware, adminMiddleware, deletarProduto);
router.post("/:id/avaliar", authMiddleware, avaliarProduto);

export default router;