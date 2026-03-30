import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    senha: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["cliente", "admin"],
      default: "cliente"
    },
    favoritos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produto"
      }
    ]
  },
  {
    timestamps: true
  }
);

const Usuario = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema);

export default Usuario;