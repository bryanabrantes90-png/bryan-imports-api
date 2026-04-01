import mongoose from "mongoose";

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome do produto é obrigatório"]
    },
    descricao: {
      type: String,
      default: ""
    },
    preco: {
      type: Number,
      required: [true, "O preço é obrigatório"],
      min: [0, "O preço não pode ser negativo"]
    },
    categoria: {
      type: String,
      required: [true, "A categoria é obrigatória"]
    },
    estoque: {
      type: Number,
      default: 0
    },
    imagem: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Produto = mongoose.model("Produto", produtoSchema);

export default Produto;