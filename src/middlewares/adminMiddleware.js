const adminMiddleware = (req, res, next) => {
  if (!req.usuario || !req.usuario.isAdmin) {
    return res.status(403).json({ message: "Acesso negado. Somente admin." });
  }

  next();
};

export default adminMiddleware;