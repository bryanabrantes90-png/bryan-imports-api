import dotenv from "dotenv";
import app from "./src/app.js";
import conectarDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

await conectarDB();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});