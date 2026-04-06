import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "O nome é obrigatório"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: [true, "A senha é obrigatória"],
      minlength: 6
    },
    tipo: {
      type: String,
      enum: ["cliente", "admin"],
      default: "cliente"
    }
  },
  {
    timestamps: true
  }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;