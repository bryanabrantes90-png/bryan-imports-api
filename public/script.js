const listaProdutos = document.getElementById("lista-produtos");

function montarUrlImagem(imagem) {
  if (!imagem || imagem.trim() === "") {
    return "https://via.placeholder.com/300x220?text=Produto";
  }

  const valor = imagem.trim();

  if (valor.startsWith("http://") || valor.startsWith("https://")) {
    return valor;
  }

  if (valor.startsWith("/uploads/")) {
    return valor;
  }

  if (valor.startsWith("uploads/")) {
    return `/${valor}`;
  }

  if (valor.startsWith("/")) {
    return valor;
  }

  return valor;
}

async function carregarProdutos() {
  try {
    const resposta = await fetch("/api/produtos");
    const produtos = await resposta.json();

    listaProdutos.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      listaProdutos.innerHTML = "<p>Nenhum produto cadastrado.</p>";
      return;
    }

    produtos.forEach((produto) => {
      const card = document.createElement("div");
      card.className = "card-produto";

      card.innerHTML = `
        <img
          src="${montarUrlImagem(produto.imagem)}"
          alt="${produto.nome}"
          onerror="this.src='https://via.placeholder.com/300x220?text=Produto'"
        >
        <div class="info">
          <h3>${produto.nome}</h3>
          <p><strong>Categoria:</strong> ${produto.categoria || "Sem categoria"}</p>
          <p class="preco">R$ ${Number(produto.preco).toFixed(2)}</p>
        </div>
      `;

      listaProdutos.appendChild(card);
    });
  } catch (error) {
    listaProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
    console.error(error);
  }
}

carregarProdutos();