import Pedido from "../models/Pedido.js";

export const criarPedido = async (req, res) => {
  try {
    const { itens, total } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ message: "Pedido sem itens" });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: "Total inválido" });
    }

    const pedido = await Pedido.create({
      usuario: req.usuario._id,
      itens,
      total
    });

    return res.status(201).json({
      message: "Pedido criado com sucesso",
      pedido
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao criar pedido" });
  }
};

export const listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("usuario", "nome email")
      .sort({ createdAt: -1 });

    return res.status(200).json(pedidos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar pedidos" });
  }
};

export const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ["pendente", "pago", "enviado", "entregue"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({ message: "Status inválido" });
    }

    const pedido = await Pedido.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!pedido) {
      return res.status(404).json({ message: "Pedido não encontrado" });
    }

    return res.status(200).json({
      message: "Status atualizado com sucesso",
      pedido
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar pedido" });
  }
};

export const listarMeusPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario._id }).sort({ createdAt: -1 });

    return res.status(200).json(pedidos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar seus pedidos" });
  }
};

export const dashboardAdmin = async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    const totalPedidos = pedidos.length;
    const faturamento = pedidos.reduce((soma, pedido) => soma + pedido.total, 0);

    const pendentes = pedidos.filter((p) => p.status === "pendente").length;
    const enviados = pedidos.filter((p) => p.status === "enviado").length;
    const entregues = pedidos.filter((p) => p.status === "entregue").length;

    return res.status(200).json({
      totalPedidos,
      faturamento,
      pendentes,
      enviados,
      entregues
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao carregar dashboard" });
  }
};