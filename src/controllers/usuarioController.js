import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-senha").sort({ createdAt: -1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, isAdmin } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        message: "Nome, email e senha são obrigatórios"
      });
    }

    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        message: "Já existe um usuário com esse email"
      });
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

export const deletarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json({ message: "Usuário removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};