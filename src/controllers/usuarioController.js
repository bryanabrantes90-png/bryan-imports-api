import bcrypt from "bcryptjs";
import Usuario from "../models/Usuario.js";

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-senha").sort({ createdAt: -1 });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar usuários",
      error: error.message
    });
  }
};

export const buscarUsuarioPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-senha");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar usuário",
      error: error.message
    });
  }
};

export const criarUsuario = async (req, res) => {
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

    const usuario = await Usuario.create({
      nome,
      email,
      senha: senhaHash,
      tipo: tipo === "admin" ? "admin" : "cliente"
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao criar usuário",
      error: error.message
    });
  }
};

export const atualizarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;

    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (email && email !== usuario.email) {
      const emailExiste = await Usuario.findOne({ email });
      if (emailExiste) {
        return res.status(400).json({ message: "Este e-mail já está em uso" });
      }
    }

    usuario.nome = nome ?? usuario.nome;
    usuario.email = email ?? usuario.email;
    usuario.tipo = tipo ?? usuario.tipo;

    if (senha) {
      usuario.senha = await bcrypt.hash(senha, 10);
    }

    await usuario.save();

    res.status(200).json({
      message: "Usuário atualizado com sucesso",
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar usuário",
      error: error.message
    });
  }
};

export const deletarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    await usuario.deleteOne();

    res.status(200).json({
      message: "Usuário removido com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao remover usuário",
      error: error.message
    });
  }
};