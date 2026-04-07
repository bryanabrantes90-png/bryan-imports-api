let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
const token = localStorage.getItem("token") || "";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function imagemProdutoUrl(imagem) {
  if (!imagem) return "https://via.placeholder.com/400x300?text=Produto";
  return imagem;
}

function adicionarAoCarrinho(produto) {
  const item = carrinho.find((p) => p._id === produto._id);

  if (item) {
    item.quantidade += 1;
  } else {
    carrinho.push({
      _id: produto._id,
      nome: produto.nome,
      preco: produto.preco,
      quantidade: 1
    });
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQuantidade(id, delta) {
  const item = carrinho.find((p) => p._id === id);
  if (!item) return;

  item.quantidade += delta;

  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((p) => p._id !== id);
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  salvarCarrinho();
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const lista = document.getElementById("listaCarrinho");
  const totalEl = document.getElementById("totalCarrinho");
  lista.innerHTML = "";

  let total = 0;

  if (carrinho.length === 0) {
    lista.innerHTML = "<p>Carrinho vazio.</p>";
    totalEl.textContent = formatarMoeda(0);
    return;
  }

  carrinho.forEach((item) => {
    total += item.preco * item.quantidade;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h3>${item.nome}</h3>
      <p>Preço: ${formatarMoeda(item.preco)}</p>
      <p>Quantidade: ${item.quantidade}</p>
      <div class="acoes">
        <button onclick="alterarQuantidade('${item._id}', 1)">+</button>
        <button onclick="alterarQuantidade('${item._id}', -1)">-</button>
      </div>
    `;
    lista.appendChild(div);
  });

  totalEl.textContent = formatarMoeda(total);
}

async function listarProdutos() {
  const nome = document.getElementById("buscaNome").value.trim();
  const categoria = document.getElementById("filtroCategoria").value;

  const params = new URLSearchParams();
  if (nome) params.append("nome", nome);
  if (categoria) params.append("categoria", categoria);

  const resposta = await fetch(`/produtos?${params.toString()}`);
  const produtos = await resposta.json();

  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  if (!Array.isArray(produtos) || produtos.length === 0) {
    lista.innerHTML = "<p>Nenhum produto encontrado.</p>";
    return;
  }

  produtos.forEach((produto) => {
    const div = document.createElement("div");
    div.className = "produto-card";
    div.innerHTML = `
      <img class="produto-imagem" src="${imagemProdutoUrl(produto.imagem)}" alt="${produto.nome}" />
      <div class="produto-corpo">
        <h3>${produto.nome}</h3>
        <p><strong>Categoria:</strong> ${produto.categoria}</p>
        <p><strong>Preço:</strong> ${formatarMoeda(produto.preco)}</p>
        <p><strong>Descrição:</strong> ${produto.descricao || "-"}</p>
        <button onclick='adicionarAoCarrinho(${JSON.stringify(produto).replace(/'/g, "&apos;")})'>Adicionar ao carrinho</button>
      </div>
    `;
    lista.appendChild(div);
  });
}

async function listarPedidos() {
  const lista = document.getElementById("listaPedidos");

  if (!token) {
    lista.innerHTML = "<p>Faça login para ver seus pedidos.</p>";
    return;
  }

  const resposta = await fetch("/pedidos", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const pedidos = await resposta.json();

  if (!resposta.ok) {
    lista.innerHTML = `<p>${pedidos.message || "Erro ao carregar pedidos."}</p>`;
    return;
  }

  lista.innerHTML = "";

  if (!pedidos.length) {
    lista.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  pedidos.forEach((pedido) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h3>Pedido #${pedido._id.slice(-6)}</h3>
      <p><strong>Total:</strong> ${formatarMoeda(pedido.total)}</p>
      <p><strong>Status:</strong> ${pedido.status}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>
      <p><strong>Telefone:</strong> ${pedido.telefone}</p>
    `;
    lista.appendChild(div);
  });
}

document.getElementById("pedidoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensagem = document.getElementById("pedidoMensagem");

  if (!token) {
    mensagem.textContent = "Faça login antes de finalizar.";
    return;
  }

  if (carrinho.length === 0) {
    mensagem.textContent = "Carrinho vazio.";
    return;
  }

  const endereco = document.getElementById("endereco").value;
  const telefone = document.getElementById("telefone").value;

  const produtos = carrinho.map((item) => ({
    produto: item._id,
    quantidade: item.quantidade
  }));

  const resposta = await fetch("/pedidos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ produtos, endereco, telefone })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagem.textContent = dados.message || "Erro ao finalizar pedido.";
    return;
  }

  const buscaInput = document.getElementById("busca");

buscaInput.addEventListener("input", () => {
  carregarProdutos(buscaInput.value);
});

  mensagem.textContent = "Pedido realizado com sucesso.";
  limparCarrinho();
  document.getElementById("pedidoForm").reset();
  listarPedidos();
});
  
renderizarCarrinho();
listarProdutos();
listarPedidos();