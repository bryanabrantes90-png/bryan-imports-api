export default (req, res, next) => {
  if (req.usuario.role !== "admin") {
    return res.status(403).json({ message: "Só admin" });
  }
  next();
};