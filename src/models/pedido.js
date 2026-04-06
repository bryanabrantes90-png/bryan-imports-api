import mongoose from "mongoose";

const itemPedidoSchema = new mongoose.Schema(
  {
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Produto",
      required: true
    },
    nome: {
      type: String,
      required: true
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1
    },
    precoUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    itens: {
      type: [itemPedidoSchema],
      required: true
    },
    valorTotal: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue", "cancelado"],
      default: "pendente"
    },
    enderecoEntrega: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Pedido = mongoose.model("Pedido", pedidoSchema);

export default Pedido;