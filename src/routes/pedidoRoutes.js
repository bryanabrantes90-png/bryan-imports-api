import express from "express";
import {
  atualizarStatusPedido,
  buscarPedidoPorId,
  criarPedido,
  listarMeusPedidos,
  listarPedidos
} from "../controllers/pedidoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, criarPedido);
router.get("/meus", authMiddleware, listarMeusPedidos);
router.get("/:id", authMiddleware, buscarPedidoPorId);
router.get("/", authMiddleware, adminMiddleware, listarPedidos);
router.patch("/:id/status", authMiddleware, adminMiddleware, atualizarStatusPedido);

export default router;