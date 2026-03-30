import Produto from "../models/Produto.js";

export const listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find().sort({ createdAt: -1 });
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao buscar produtos" });
  }
};

export const criarProduto = async (req, res) => {
  try {
    const { nome, preco, imagem, descricao } = req.body;

    if (!nome || preco === undefined || !imagem || !descricao) {
      return res.status(400).json({ message: "Preencha todos os campos do produto" });
    }

    const produto = await Produto.create({
      nome,
      preco,
      imagem,
      descricao
    });

    return res.status(201).json(produto);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar produto" });
  }
};

export const deletarProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await Produto.findByIdAndDelete(id);

    return res.status(200).json({ message: "Produto removido com sucesso" });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao remover produto" });
  }
};

export const avaliarProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { estrelas, comentario } = req.body;

    if (!estrelas || estrelas < 1 || estrelas > 5) {
      return res.status(400).json({ message: "Avaliação deve ser entre 1 e 5 estrelas" });
    }

    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const avaliacaoExistente = produto.avaliacoes.find(
      (a) => String(a.usuario) === String(req.usuario._id)
    );

    if (avaliacaoExistente) {
      avaliacaoExistente.estrelas = estrelas;
      avaliacaoExistente.comentario = comentario || "";
      avaliacaoExistente.nome = req.usuario.nome;
    } else {
      produto.avaliacoes.push({
        usuario: req.usuario._id,
        nome: req.usuario.nome,
        estrelas,
        comentario: comentario || ""
      });
    }

    await produto.save();

    return res.status(200).json({
      message: "Avaliação enviada com sucesso",
      produto
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao avaliar produto" });
  }
};