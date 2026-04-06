import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./src/config/db.js";
import Usuario from "./src/models/Usuario.js";

dotenv.config();

const criarAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@admin.com";
    const senha = "123456";

    const adminExiste = await Usuario.findOne({ email });

    if (adminExiste) {
      console.log("Admin já existe.");
      await mongoose.connection.close();
      process.exit();
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await Usuario.create({
      nome: "Administrador",
      email,
      senha: senhaHash,
      tipo: "admin"
    });

    console.log("Admin criado com sucesso.");
    console.log("Email: admin@admin.com");
    console.log("Senha: 123456");

    await mongoose.connection.close();
    process.exit();
  } catch (error) {
    console.error("Erro ao criar admin:", error.message);
    process.exit(1);
  }
};

criarAdmin();