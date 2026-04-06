import express from "express";
import {
  atualizarUsuario,
  buscarUsuarioPorId,
  criarUsuario,
  deletarUsuario,
  listarUsuarios
} from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, listarUsuarios);
router.get("/:id", authMiddleware, adminMiddleware, buscarUsuarioPorId);
router.post("/", authMiddleware, adminMiddleware, criarUsuario);
router.put("/:id", authMiddleware, adminMiddleware, atualizarUsuario);
router.delete("/:id", authMiddleware, adminMiddleware, deletarUsuario);

export default router;