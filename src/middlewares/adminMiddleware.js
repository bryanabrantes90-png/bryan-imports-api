const adminMiddleware = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  if (req.usuario.tipo !== "admin") {
    return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }

  next();
};

export default adminMiddleware;