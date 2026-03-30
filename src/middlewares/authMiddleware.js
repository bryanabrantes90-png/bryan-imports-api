import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export default async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token não informado" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.usuario = await Usuario.findById(decoded.id);

  next();
};