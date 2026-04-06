import express from "express";
import { login, perfil, registrar } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/registrar", registrar);
router.post("/login", login);
router.get("/perfil", authMiddleware, perfil);

export default router;