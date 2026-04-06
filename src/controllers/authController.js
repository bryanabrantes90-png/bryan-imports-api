import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios"
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
      return res.status(400).json({
        message: "Já existe um usuário com este e-mail"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      tipo: tipo === "admin" ? "admin" : "cliente"
    });

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo
      },
      token: gerarToken(novoUsuario._id)
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao registrar usuário",
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios"
      });
    }

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos"
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos"
      });
    }

    res.status(200).json({
      message: "Login realizado com sucesso",
      token: gerarToken(usuario._id),
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao realizar login",
      error: error.message
    });
  }
};

export const perfil = async (req, res) => {
  try {
    res.status(200).json(req.usuario);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar perfil",
      error: error.message
    });
  }
};