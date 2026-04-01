import Pedido from "../models/Pedido.js";
import Produto from "../models/Produto.js";

export const criarPedido = async (req, res) => {
  try {
    const { produtos, endereco, telefone } = req.body;

    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({
        message: "Informe os produtos do pedido"
      });
    }

    if (!endereco || !telefone) {
      return res.status(400).json({
        message: "Endereço e telefone são obrigatórios"
      });
    }

    let total = 0;
    const produtosValidados = [];

    for (const item of produtos) {
      const produtoEncontrado = await Produto.findById(item.produto);

      if (!produtoEncontrado) {
        return res.status(404).json({
          message: `Produto não encontrado: ${item.produto}`
        });
      }

      const quantidade = Number(item.quantidade);

      if (quantidade <= 0) {
        return res.status(400).json({
          message: "A quantidade deve ser maior que 0"
        });
      }

      total += produtoEncontrado.preco * quantidade;

      produtosValidados.push({
        produto: produtoEncontrado._id,
        quantidade
      });
    }

    const novoPedido = await Pedido.create({
      usuario: req.usuario.id,
      produtos: produtosValidados,
      total,
      endereco,
      telefone
    });

    const pedidoCompleto = await Pedido.findById(novoPedido._id)
      .populate("usuario", "nome email")
      .populate("produtos.produto", "nome preco categoria imagem");

    res.status(201).json({
      message: "Pedido criado com sucesso",
      pedido: pedidoCompleto
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listarPedidos = async (req, res) => {
  try {
    const filtro = req.usuario.isAdmin ? {} : { usuario: req.usuario.id };

    const pedidos = await Pedido.find(filtro)
      .populate("usuario", "nome email")
      .populate("produtos.produto", "nome preco categoria imagem")
      .sort({ createdAt: -1 });

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const atualizarStatusPedido = async (req, res) => {
  try {
    const { status } = req.body;

    const statusPermitidos = ["pendente", "aprovado", "enviado", "entregue"];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({
        message: "Status inválido"
      });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    pedido.status = status;
    await pedido.save();

    const pedidoAtualizado = await Pedido.findById(pedido._id)
      .populate("usuario", "nome email")
      .populate("produtos.produto", "nome preco categoria imagem");

    res.status(200).json({
      message: "Status do pedido atualizado com sucesso",
      pedido: pedidoAtualizado
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};