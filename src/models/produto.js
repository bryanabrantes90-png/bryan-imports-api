import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do produto é obrigatório"],
      trim: true
    },
    descricao: {
      type: String,
      default: ""
    },
    categoria: {
      type: String,
      required: [true, "A categoria é obrigatória"],
      trim: true
    },
    preco: {
      type: Number,
      required: [true, "O preço é obrigatório"],
      min: [0, "O preço não pode ser negativo"]
    },
    estoque: {
      type: Number,
      default: 0,
      min: [0, "O estoque não pode ser negativo"]
    },
    imagem: {
      type: String,
      default: ""
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Produto = mongoose.model("Produto", produtoSchema);

export default Produto;