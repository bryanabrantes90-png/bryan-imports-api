import { Router } from "express";
import {
  criarPedido,
  listarPedidos,
  atualizarStatusPedido,
  listarMeusPedidos,
  dashboardAdmin
} from "../controllers/pedidoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.post("/", authMiddleware, criarPedido);
router.get("/meus", authMiddleware, listarMeusPedidos);
router.get("/", authMiddleware, adminMiddleware, listarPedidos);
router.get("/dashboard/admin", authMiddleware, adminMiddleware, dashboardAdmin);
router.patch("/:id/status", authMiddleware, adminMiddleware, atualizarStatusPedido);

export default router;