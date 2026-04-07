const listaProdutos = document.getElementById("lista-produtos");
const buscaInput = document.getElementById("busca");
const filtroCategoria = document.getElementById("filtro-categoria");
const contadorProdutos = document.getElementById("contador-produtos");

const btnAbrirCarrinho = document.getElementById("btn-abrir-carrinho");
const btnFecharCarrinho = document.getElementById("btn-fechar-carrinho");
const overlayCarrinho = document.getElementById("overlay-carrinho");
const carrinhoLateral = document.getElementById("carrinho-lateral");

const badgeCarrinho = document.getElementById("badge-carrinho");
const carrinhoItens = document.getElementById("carrinho-itens");
const carrinhoTotal = document.getElementById("carrinho-total");
const checkoutSubtotal = document.getElementById("checkout-subtotal");
const checkoutFrete = document.getElementById("checkout-frete");
const btnLimparCarrinho = document.getElementById("btn-limpar-carrinho");
const btnFinalizarPedido = document.getElementById("btn-finalizar-pedido");
const mensagemCarrinho = document.getElementById("mensagem-carrinho");
const enderecoEntrega = document.getElementById("endereco-entrega");

let produtosGlobais = [];
let carrinho = JSON.parse(localStorage.getItem("carrinhoBryanImports")) || [];

function salvarCarrinho() {
  localStorage.setItem("carrinhoBryanImports", JSON.stringify(carrinho));
}

function montarUrlImagem(imagem) {
  if (!imagem || imagem.trim() === "") {
    return "https://via.placeholder.com/400x300?text=Produto";
  }

  const valor = imagem.trim();

  if (valor.startsWith("http://") || valor.startsWith("https://")) return valor;
  if (valor.startsWith("/uploads/")) return valor;
  if (valor.startsWith("uploads/")) return `/${valor}`;
  if (valor.startsWith("/")) return valor;

  return valor;
}

function formatarPreco(valor) {
  return `R$ ${Number(valor).toFixed(2).replace(".", ",")}`;
}

function preencherCategorias(produtos) {
  const categorias = [...new Set(produtos.map((p) => p.categoria).filter(Boolean))];

  filtroCategoria.innerHTML = `<option value="">Todas as categorias</option>`;

  categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    filtroCategoria.appendChild(option);
  });
}

function renderizarProdutos(produtos) {
  listaProdutos.innerHTML = "";
  contadorProdutos.textContent = `${produtos.length} produto(s) encontrado(s)`;

  if (!produtos.length) {
    listaProdutos.innerHTML = `
      <div class="estado-vazio">
        <h3>Nenhum produto encontrado</h3>
        <p>Tente outro nome ou categoria.</p>
      </div>
    `;
    return;
  }

  produtos.forEach((produto) => {
    const card = document.createElement("div");
    card.className = "card-produto";

    card.innerHTML = `
      <img
        class="imagem-produto"
        src="${montarUrlImagem(produto.imagem)}"
        alt="${produto.nome}"
        onerror="this.src='https://via.placeholder.com/400x300?text=Produto'"
      />

      <div class="info-produto">
        <span class="badge-categoria">${produto.categoria || "Sem categoria"}</span>
        <h3 class="nome-produto">${produto.nome}</h3>
        <p class="descricao-produto">${produto.descricao || "Produto premium disponível na loja."}</p>

        <div class="rodape-produto">
          <span class="preco">${formatarPreco(produto.preco)}</span>
          <button class="btn-comprar">Adicionar</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-comprar").addEventListener("click", () => adicionarAoCarrinho(produto._id));
    listaProdutos.appendChild(card);
  });
}

function aplicarFiltros() {
  const termo = buscaInput.value.trim().toLowerCase();
  const categoriaSelecionada = filtroCategoria.value;

  const filtrados = produtosGlobais.filter((produto) => {
    const nome = (produto.nome || "").toLowerCase();
    const descricao = (produto.descricao || "").toLowerCase();
    const categoria = produto.categoria || "";

    const bateBusca = nome.includes(termo) || descricao.includes(termo);
    const bateCategoria = !categoriaSelecionada || categoria === categoriaSelecionada;

    return bateBusca && bateCategoria;
  });

  renderizarProdutos(filtrados);
}

async function carregarProdutos() {
  try {
    listaProdutos.innerHTML = `
      <div class="estado-vazio">
        <h3>Carregando produtos...</h3>
      </div>
    `;

    const resposta = await fetch("/api/produtos");
    const produtos = await resposta.json();

    if (!Array.isArray(produtos)) throw new Error("Resposta inválida da API");

    produtosGlobais = produtos;
    preencherCategorias(produtosGlobais);
    renderizarProdutos(produtosGlobais);
  } catch (error) {
    contadorProdutos.textContent = "Erro ao carregar";
    listaProdutos.innerHTML = `
      <div class="estado-vazio">
        <h3>Erro ao carregar produtos</h3>
        <p>Verifique se o servidor está rodando.</p>
      </div>
    `;
    console.error(error);
  }
}

function abrirCarrinho() {
  carrinhoLateral.classList.add("aberto");
  overlayCarrinho.classList.add("ativo");
  document.body.classList.add("carrinho-aberto");
}

function fecharCarrinho() {
  carrinhoLateral.classList.remove("aberto");
  overlayCarrinho.classList.remove("ativo");
  document.body.classList.remove("carrinho-aberto");
}

function atualizarBadgeCarrinho() {
  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  badgeCarrinho.textContent = totalItens;
}

function calcularSubtotal() {
  return carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
}

function calcularFrete() {
  const subtotal = calcularSubtotal();
  if (!subtotal) return 0;
  if (subtotal >= 300) return 0;
  return 19.9;
}

function calcularTotal() {
  return calcularSubtotal() + calcularFrete();
}

function renderizarCarrinho() {
  carrinhoItens.innerHTML = "";

  if (!carrinho.length) {
    carrinhoItens.innerHTML = `
      <div class="estado-vazio">
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione produtos para continuar.</p>
      </div>
    `;
  } else {
    carrinho.forEach((item) => {
      const div = document.createElement("div");
      div.className = "item-carrinho";

      div.innerHTML = `
        <img
          src="${montarUrlImagem(item.imagem)}"
          alt="${item.nome}"
          onerror="this.src='https://via.placeholder.com/120x120?text=Produto'"
        />

        <div>
          <h4>${item.nome}</h4>
          <p>${formatarPreco(item.preco)} cada</p>

          <div class="item-controles">
            <button type="button" data-acao="menos">-</button>
            <span>${item.quantidade}</span>
            <button type="button" data-acao="mais">+</button>
            <button type="button" class="btn-remover" data-acao="remover">Remover</button>
          </div>
        </div>
      `;

      div.querySelector('[data-acao="menos"]').addEventListener("click", () => diminuirQuantidade(item._id));
      div.querySelector('[data-acao="mais"]').addEventListener("click", () => aumentarQuantidade(item._id));
      div.querySelector('[data-acao="remover"]').addEventListener("click", () => removerDoCarrinho(item._id));

      carrinhoItens.appendChild(div);
    });
  }

  checkoutSubtotal.textContent = formatarPreco(calcularSubtotal());
  checkoutFrete.textContent = formatarPreco(calcularFrete());
  carrinhoTotal.textContent = formatarPreco(calcularTotal());
  atualizarBadgeCarrinho();
  salvarCarrinho();
}

function mostrarMensagemCarrinho(texto, cor = "green") {
  mensagemCarrinho.textContent = texto;
  mensagemCarrinho.style.color = cor;
}

function adicionarAoCarrinho(id) {
  const produto = produtosGlobais.find((p) => p._id === id);

  if (!produto) {
    mostrarMensagemCarrinho("Produto não encontrado.", "red");
    return;
  }

  const itemExistente = carrinho.find((item) => item._id === id);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      _id: produto._id,
      nome: produto.nome,
      preco: Number(produto.preco),
      imagem: produto.imagem || "",
      quantidade: 1
    });
  }

  renderizarCarrinho();
  abrirCarrinho();
  mostrarMensagemCarrinho("Produto adicionado ao carrinho!", "green");
}

function aumentarQuantidade(id) {
  const item = carrinho.find((produto) => produto._id === id);
  if (!item) return;
  item.quantidade += 1;
  renderizarCarrinho();
}

function diminuirQuantidade(id) {
  const item = carrinho.find((produto) => produto._id === id);
  if (!item) return;

  item.quantidade -= 1;

  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((produto) => produto._id !== id);
  }

  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter((produto) => produto._id !== id);
  renderizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  renderizarCarrinho();
  mostrarMensagemCarrinho("Carrinho limpo.", "#374151");
}

async function finalizarPedido() {
  const token = localStorage.getItem("token");

  if (!token) {
    mostrarMensagemCarrinho("Faça login para finalizar o pedido.", "red");
    return;
  }

  if (!carrinho.length) {
    mostrarMensagemCarrinho("Seu carrinho está vazio.", "red");
    return;
  }

  const endereco = enderecoEntrega.value.trim();

  if (!endereco) {
    mostrarMensagemCarrinho("Informe o endereço de entrega.", "red");
    return;
  }

  try {
    mostrarMensagemCarrinho("Enviando pedido...", "#374151");

    const payload = {
      itens: carrinho.map((item) => ({
        produto: item._id,
        quantidade: item.quantidade
      })),
      enderecoEntrega: endereco
    };

    const resposta = await fetch("/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagemCarrinho(dados.message || "Erro ao finalizar pedido.", "red");
      return;
    }

    carrinho = [];
    enderecoEntrega.value = "";
    renderizarCarrinho();
    mostrarMensagemCarrinho("Pedido finalizado com sucesso!", "green");

    setTimeout(() => {
      window.location.href = "pedidos.html";
    }, 1200);
  } catch (error) {
    mostrarMensagemCarrinho("Erro ao conectar com o servidor.", "red");
    console.error(error);
  }
}

btnAbrirCarrinho.addEventListener("click", abrirCarrinho);
btnFecharCarrinho.addEventListener("click", fecharCarrinho);
overlayCarrinho.addEventListener("click", fecharCarrinho);
btnLimparCarrinho.addEventListener("click", limparCarrinho);
btnFinalizarPedido.addEventListener("click", finalizarPedido);

buscaInput.addEventListener("input", aplicarFiltros);
filtroCategoria.addEventListener("change", aplicarFiltros);

renderizarCarrinho();
carregarProdutos();