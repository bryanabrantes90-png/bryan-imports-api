import Usuario from "../models/Usuario.js";

export const toggleFavorito = async (req, res) => {
  try {
    const { produtoId } = req.body;

    if (!produtoId) {
      return res.status(400).json({ message: "Produto não informado" });
    }

    const usuario = await Usuario.findById(req.usuario._id);

    const jaExiste = usuario.favoritos.some(
      (id) => String(id) === String(produtoId)
    );

    if (jaExiste) {
      usuario.favoritos = usuario.favoritos.filter(
        (id) => String(id) !== String(produtoId)
      );
    } else {
      usuario.favoritos.push(produtoId);
    }

    await usuario.save();

    return res.status(200).json({
      message: "Favoritos atualizados",
      favoritos: usuario.favoritos
    });
  } catch (error) {
    return res.status(500).json({ message: "Erro ao atualizar favoritos" });
  }
};

export const listarFavoritos = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id).populate("favoritos");

    return res.status(200).json(usuario.favoritos);
  } catch (error) {
    return res.status(500).json({ message: "Erro ao listar favoritos" });
  }
};