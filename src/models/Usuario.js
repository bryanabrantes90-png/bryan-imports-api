import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"]
    },
    email: {
      type: String,
      required: [true, "O email é obrigatório"],
      unique: true
    },
    senha: {
      type: String,
      required: [true, "A senha é obrigatória"]
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;