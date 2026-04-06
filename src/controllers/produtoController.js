import Produto from "../models/Produto.js";

export const listarProdutos = async (req, res) => {
  try {
    const { nome, categoria } = req.query;

    const filtro = { ativo: true };

    if (nome) filtro.nome = { $regex: nome, $options: "i" };
    if (categoria) filtro.categoria = { $regex: categoria, $options: "i" };

    const produtos = await Produto.find(filtro).sort({ createdAt: -1 });

    res.status(200).json(produtos);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar produtos",
      error: error.message
    });
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
    res.status(500).json({
      message: "Erro ao buscar produto",
      error: error.message
    });
  }
};

export const criarProduto = async (req, res) => {
  try {
    const { nome, descricao, categoria, preco, estoque, imagem } = req.body;

    if (!nome || !categoria || preco === undefined) {
      return res.status(400).json({
        message: "Nome, categoria e preço são obrigatórios"
      });
    }

    if (Number(preco) < 0) {
      return res.status(400).json({ message: "O preço não pode ser negativo" });
    }

    if (estoque !== undefined && Number(estoque) < 0) {
      return res.status(400).json({ message: "O estoque não pode ser negativo" });
    }

    const novoProduto = await Produto.create({
      nome,
      descricao: descricao || "",
      categoria,
      preco: Number(preco),
      estoque: estoque !== undefined ? Number(estoque) : 0,
      imagem: imagem || "",
      ativo: true
    });

    res.status(201).json({
      message: "Produto cadastrado com sucesso",
      produto: novoProduto
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao cadastrar produto",
      error: error.message
    });
  }
};

export const atualizarProduto = async (req, res) => {
  try {
    const { nome, descricao, categoria, preco, estoque, imagem, ativo } = req.body;

    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    if (preco !== undefined && Number(preco) < 0) {
      return res.status(400).json({ message: "O preço não pode ser negativo" });
    }

    if (estoque !== undefined && Number(estoque) < 0) {
      return res.status(400).json({ message: "O estoque não pode ser negativo" });
    }

    produto.nome = nome ?? produto.nome;
    produto.descricao = descricao ?? produto.descricao;
    produto.categoria = categoria ?? produto.categoria;
    produto.preco = preco !== undefined ? Number(preco) : produto.preco;
    produto.estoque = estoque !== undefined ? Number(estoque) : produto.estoque;
    produto.imagem = imagem !== undefined ? imagem : produto.imagem;
    produto.ativo = ativo !== undefined ? ativo : produto.ativo;

    await produto.save();

    res.status(200).json({
      message: "Produto atualizado com sucesso",
      produto
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar produto",
      error: error.message
    });
  }
};

export const deletarProduto = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await produto.deleteOne();

    res.status(200).json({
      message: "Produto removido com sucesso"
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao remover produto",
      error: error.message
    });
  }
};

export const uploadImagemProduto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhuma imagem enviada" });
    }

    const urlImagem = `/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "Imagem enviada com sucesso",
      imagem: urlImagem
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao fazer upload da imagem",
      error: error.message
    });
  }
};