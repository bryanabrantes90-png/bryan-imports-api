import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, isAdmin } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórios"
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({ message: "Usuário já cadastrado" });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      isAdmin: isAdmin || false
    });

    res.status(201).json({
      message: "Usuário cadastrado com sucesso",
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        isAdmin: novoUsuario.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "Email e senha são obrigatórios"
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(400).json({ message: "Email ou senha inválidos" });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        isAdmin: usuario.isAdmin
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        isAdmin: usuario.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};