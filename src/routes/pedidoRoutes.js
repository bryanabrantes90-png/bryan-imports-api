import { Router } from "express";
import {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido
} from "../controllers/pedidoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.post("/", authMiddleware, criarPedido);
router.get("/", authMiddleware, listarPedidos);
router.put("/:id/status", authMiddleware, adminMiddleware, atualizarStatusPedido);

export default router;