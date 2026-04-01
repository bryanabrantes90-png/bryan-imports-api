import mongoose from "mongoose";

const pedidoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    produtos: [
      {
        produto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produto",
          required: true
        },
        quantidade: {
          type: Number,
          required: true,
          min: [1, "A quantidade mínima é 1"]
        }
      }
    ],
    total: {
      type: Number,
      required: true,
      min: [0, "O total não pode ser negativo"]
    },
    status: {
      type: String,
      default: "pendente"
    },
    endereco: {
      type: String,
      required: [true, "O endereço é obrigatório"]
    },
    telefone: {
      type: String,
      required: [true, "O telefone é obrigatório"]
    }
  },
  { timestamps: true }
);

const Pedido = mongoose.model("Pedido", pedidoSchema);

export default Pedido;