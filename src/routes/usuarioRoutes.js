import { Router } from "express";
import { toggleFavorito, listarFavoritos } from "../controllers/usuarioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/favoritos", authMiddleware, toggleFavorito);
router.get("/favoritos", authMiddleware, listarFavoritos);

export default router;