import mongoose from "mongoose";

const schema = new mongoose.Schema({
  nome: String,
  preco: Number,
  imagem: String,
  descricao: String
});

export default mongoose.model("Produto", schema);