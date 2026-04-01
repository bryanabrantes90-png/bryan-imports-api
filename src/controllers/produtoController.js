import Produto from "../models/Produto.js";
import fs from "fs";
import path from "path";

const removerImagemLocal = (imagemPath) => {
  if (!imagemPath) return;
  if (!imagemPath.startsWith("/uploads/")) return;

  const caminhoCompleto = path.resolve("public", imagemPath.replace(/^\//, ""));

  if (fs.existsSync(caminhoCompleto)) {
    fs.unlinkSync(caminhoCompleto);
  }
};

export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, preco, categoria, estoque, imagemUrl } = req.body;

    if (!nome || preco === undefined || !categoria) {
      return res.status(400).json({
        message: "Nome, preço e categoria são obrigatórios"
      });
    }

    if (Number(preco) < 0) {
      return res.status(400).json({
        message: "O preço não pode ser negativo"
      });
    }

    let imagem = "";

    if (req.file) {
      imagem = `/uploads/${req.file.filename}`;
    } else if (imagemUrl) {
      imagem = imagemUrl;
    }

    const novoProduto = await Produto.create({
      nome,
      descricao,
      preco: Number(preco),
      categoria,
      estoque: Number(estoque || 0),
      imagem
    });

    res.status(201).json({
      message: "Produto cadastrado com sucesso",
      produto: novoProduto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarProdutos = async (req, res) => {
  try {
    const filtro = {};
    const { nome, categoria } = req.query;

    if (nome) {
      filtro.nome = { $regex: nome, $options: "i" };
    }

    if (categoria) {
      filtro.categoria = categoria;
    }

    const produtos = await Produto.find(filtro).sort({ createdAt: -1 });
    res.status(200).json(produtos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buscarProdutoPorId = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    res.status(200).json(produto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarProduto = async (req, res) => {
  try {
    const {
      nome,
      descricao,
      preco,
      categoria,
      estoque,
      imagemUrl,
      removerImagem
    } = req.body;

    if (preco !== undefined && Number(preco) < 0) {
      return res.status(400).json({
        message: "O preço não pode ser negativo"
      });
    }

    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    produto.nome = nome ?? produto.nome;
    produto.descricao = descricao ?? produto.descricao;
    produto.preco = preco !== undefined ? Number(preco) : produto.preco;
    produto.categoria = categoria ?? produto.categoria;
    produto.estoque = estoque !== undefined ? Number(estoque) : produto.estoque;

    if (removerImagem === "true") {
      removerImagemLocal(produto.imagem);
      produto.imagem = "";
    }

    if (req.file) {
      removerImagemLocal(produto.imagem);
      produto.imagem = `/uploads/${req.file.filename}`;
    } else if (imagemUrl !== undefined && imagemUrl !== "") {
      if (imagemUrl !== produto.imagem) {
        removerImagemLocal(produto.imagem);
        produto.imagem = imagemUrl;
      }
    } else if (imagemUrl === "" && removerImagem !== "true" && !req.file) {
      if (!produto.imagem?.startsWith("/uploads/")) {
        produto.imagem = "";
      }
    }

    await produto.save();

    res.status(200).json({
      message: "Produto atualizado com sucesso",
      produto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    removerImagemLocal(produto.imagem);

    res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};