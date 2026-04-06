import express from "express";
import {
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  deletarProduto,
  listarProdutos,
  uploadImagemProduto
} from "../controllers/produtoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", listarProdutos);
router.get("/:id", buscarProdutoPorId);

router.post("/", authMiddleware, adminMiddleware, criarProduto);
router.put("/:id", authMiddleware, adminMiddleware, atualizarProduto);
router.delete("/:id", authMiddleware, adminMiddleware, deletarProduto);

router.post(
  "/upload/imagem",
  authMiddleware,
  adminMiddleware,
  upload.single("imagem"),
  uploadImagemProduto
);

export default router;