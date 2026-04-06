import Pedido from "../models/Pedido.js";
import Produto from "../models/Produto.js";

export const criarPedido = async (req, res) => {
  try {
    const { itens, enderecoEntrega } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        message: "Informe pelo menos um item para o pedido"
      });
    }

    const itensProcessados = [];
    let valorTotal = 0;

    for (const item of itens) {
      const produto = await Produto.findById(item.produto);

      if (!produto) {
        return res.status(404).json({
          message: `Produto não encontrado: ${item.produto}`
        });
      }

      if (!produto.ativo) {
        return res.status(400).json({
          message: `Produto inativo: ${produto.nome}`
        });
      }

      const quantidade = Number(item.quantidade);

      if (!quantidade || quantidade < 1) {
        return res.status(400).json({
          message: `Quantidade inválida para o produto ${produto.nome}`
        });
      }

      if (produto.estoque < quantidade) {
        return res.status(400).json({
          message: `Estoque insuficiente para o produto ${produto.nome}`
        });
      }

      const subtotal = produto.preco * quantidade;

      itensProcessados.push({
        produto: produto._id,
        nome: produto.nome,
        quantidade,
        precoUnitario: produto.preco,
        subtotal
      });

      valorTotal += subtotal;
    }

    for (const item of itensProcessados) {
      const produto = await Produto.findById(item.produto);
      produto.estoque -= item.quantidade;
      await produto.save();
    }

    const pedido = await Pedido.create({
      usuario: req.usuario._id,
      itens: itensProcessados,
      valorTotal,
      enderecoEntrega: enderecoEntrega || ""
    });

    const pedidoCompleto = await Pedido.findById(pedido._id)
      .populate("usuario", "nome email")
      .populate("itens.produto", "nome imagem");

    res.status(201).json({
      message: "Pedido criado com sucesso",
      pedido: pedidoCompleto
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao criar pedido",
      error: error.message
    });
  }
};

export const listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("usuario", "nome email tipo")
      .populate("itens.produto", "nome imagem")
      .sort({ createdAt: -1 });

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar pedidos",
      error: error.message
    });
  }
};

export const listarMeusPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario._id })
      .populate("itens.produto", "nome imagem")
      .sort({ createdAt: -1 });

    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao listar seus pedidos",
      error: error.message
    });
  }
};

export const buscarPedidoPorId = async (req, res) => {
  try {
    const pedido = await Pedido.findById(req.params.id)
      .populate("usuario", "nome email tipo")
      .populate("itens.produto", "nome imagem");

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    const ehDono = pedido.usuario._id.toString() === req.usuario._id.toString();
    const ehAdmin = req.usuario.tipo === "admin";

    if (!ehDono && !ehAdmin) {
      return res.status(403).json({
        message: "Acesso negado a este pedido"
      });
    }

    res.status(200).json(pedido);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar pedido",
      error: error.message
    });
  }
};

export const atualizarStatusPedido = async (req, res) => {
  try {
    const { status } = req.body;
    const statusPermitidos = ["pendente", "pago", "enviado", "entregue", "cancelado"];

    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const pedido = await Pedido.findById(req.params.id);

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    pedido.status = status;
    await pedido.save();

    res.status(200).json({
      message: "Status do pedido atualizado com sucesso",
      pedido
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao atualizar status do pedido",
      error: error.message
    });
  }
};