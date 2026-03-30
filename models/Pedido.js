import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario"
    },
    itens: {
      type: Array,
      default: []
    },
    total: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: "pendente"
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Pedido", schema);