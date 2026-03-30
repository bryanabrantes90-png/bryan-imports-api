import mongoose from "mongoose";

const avaliacaoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true
    },
    nome: {
      type: String,
      required: true
    },
    estrelas: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comentario: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    preco: {
      type: Number,
      required: true,
      min: [0, "O preço não pode ser negativo"]
    },
    imagem: {
      type: String,
      required: true
    },
    descricao: {
      type: String,
      required: true,
      trim: true
    },
    avaliacoes: [avaliacaoSchema]
  },
  {
    timestamps: true
  }
);

const Produto = mongoose.models.Produto || mongoose.model("Produto", produtoSchema);

export default Produto;