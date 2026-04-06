import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não informado" });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2) {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    const [scheme, token] = partes;

    if (scheme !== "Bearer") {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id).select("-senha");

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

export default authMiddleware;