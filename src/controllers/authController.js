import Usuario from "../models/Usuario.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registrar = async (req, res) => {
  const { nome, email, senha } = req.body;

  const hash = await bcrypt.hash(senha, 10);

  const user = await Usuario.create({
    nome,
    email,
    senha: hash
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ user, token });
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  const user = await Usuario.findOne({ email });

  const ok = await bcrypt.compare(senha, user.senha);

  if (!ok) return res.status(401).json({ message: "Erro" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ user, token });
};