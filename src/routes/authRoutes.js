import { Router } from "express";
import { login, registrar } from "../controllers/authController.js";

const router = Router();

router.post("/registrar", registrar);
router.post("/login", login);

export default router;