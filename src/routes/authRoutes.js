import { Router } from "express";
import { registrar, login } from "../controllers/authController.js";

const r = Router();

r.post("/registrar", registrar);
r.post("/login", login);

export default r;