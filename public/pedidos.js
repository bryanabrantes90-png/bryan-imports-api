const listaPedidos = document.getElementById("lista-pedidos");
const btnAtualizarPedidos = document.getElementById("btn-atualizar-pedidos");

function montarUrlImagem(imagem) {
  if (!imagem || imagem.trim() === "") {
    return "https://via.placeholder.com/120x120?text=Produto";
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

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

function classeStatus(status) {
  return `status-${status || "pendente"}`;
}

function renderizarPedidos(pedidos) {
  listaPedidos.innerHTML = "";

  if (!pedidos.length) {
    listaPedidos.innerHTML = `
      <div class="estado-vazio">
        <h3>Nenhum pedido encontrado</h3>
        <p>Faça uma compra para ver seus pedidos aqui.</p>
      </div>
    `;
    return;
  }

  pedidos.forEach((pedido) => {
    const card = document.createElement("article");
    card.className = "card-pedido";

    const itensHtml = (pedido.itens || []).map((item) => `
      <div class="item-pedido">
        <img
          src="${montarUrlImagem(item.produto?.imagem || "")}"
          alt="${item.nome}"
          onerror="this.src='https://via.placeholder.com/120x120?text=Produto'"
        />

        <div>
          <strong>${item.nome}</strong>
          <p class="texto-suave">Qtd: ${item.quantidade}</p>
        </div>

        <strong>${formatarPreco(item.subtotal)}</strong>
      </div>
    `).join("");

    card.innerHTML = `
      <div class="info-pedido">
        <div class="topo-pedido">
          <div>
            <h3>Pedido #${pedido._id.slice(-6).toUpperCase()}</h3>
            <p class="texto-suave">Criado em ${formatarData(pedido.createdAt)}</p>
          </div>

          <span class="badge-status ${classeStatus(pedido.status)}">
            ${pedido.status}
          </span>
        </div>

        <div class="grid-info-pedido">
          <div class="bloco-info">
            <span>Total</span>
            <strong>${formatarPreco(pedido.valorTotal)}</strong>
          </div>

          <div class="bloco-info">
            <span>Itens</span>
            <strong>${pedido.itens.length}</strong>
          </div>

          <div class="bloco-info">
            <span>Entrega</span>
            <strong>${pedido.enderecoEntrega || "Não informado"}</strong>
          </div>
        </div>

        <div class="lista-itens-pedido">
          ${itensHtml}
        </div>
      </div>
    `;

    listaPedidos.appendChild(card);
  });
}

async function carregarPedidos() {
  const token = localStorage.getItem("token");

  if (!token) {
    listaPedidos.innerHTML = `
      <div class="estado-vazio">
        <h3>Você precisa fazer login</h3>
        <p>Entre com sua conta para ver seus pedidos.</p>
      </div>
    `;
    return;
  }

  try {
    listaPedidos.innerHTML = `
      <div class="estado-vazio">
        <h3>Carregando pedidos...</h3>
      </div>
    `;

    const resposta = await fetch("/api/pedidos/meus", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      listaPedidos.innerHTML = `
        <div class="estado-vazio">
          <h3>Erro ao carregar pedidos</h3>
          <p>${dados.message || "Não foi possível buscar seus pedidos."}</p>
        </div>
      `;
      return;
    }

    renderizarPedidos(dados);
  } catch (error) {
    listaPedidos.innerHTML = `
      <div class="estado-vazio">
        <h3>Erro ao conectar</h3>
        <p>Verifique se o servidor está rodando.</p>
      </div>
    `;
    console.error(error);
  }
}

btnAtualizarPedidos.addEventListener("click", carregarPedidos);

carregarPedidos();