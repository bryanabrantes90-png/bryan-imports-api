import mongoose from "mongoose";

const itemPedidoSchema = new mongoose.Schema(
  {
    produtoId: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    nome: {
      type: String,
      required: true
    },
    preco: {
      type: Number,
      required: true
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1
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
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pendente", "pago", "enviado", "entregue"],
      default: "pendente"
    }
  },
  {
    timestamps: true
  }
);

const Pedido = mongoose.models.Pedido || mongoose.model("Pedido", pedidoSchema);

export default Pedido;