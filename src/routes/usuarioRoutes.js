import { Router } from "express";
import {
  listarUsuarios,
  criarUsuario,
  deletarUsuario
} from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, listarUsuarios);
router.post("/", authMiddleware, adminMiddleware, criarUsuario);
router.delete("/:id", authMiddleware, adminMiddleware, deletarUsuario);

export default router;