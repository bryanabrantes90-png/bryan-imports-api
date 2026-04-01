import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve("public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname);
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    cb(null, nomeArquivo);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpg|jpeg|png|webp/;
  const extValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeValido = tiposPermitidos.test(file.mimetype);

  if (extValida && mimeValido) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens jpg, jpeg, png ou webp são permitidas"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload;