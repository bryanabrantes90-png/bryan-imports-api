const API = "";
let token = localStorage.getItem("token") || "";
let usuario = JSON.parse(localStorage.getItem("usuario")) || null;
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

const usuarioLogado = document.getElementById("usuarioLogado");
const loginMensagem = document.getElementById("loginMensagem");
const cadastroMensagem = document.getElementById("cadastroMensagem");
const produtoMensagem = document.getElementById("produtoMensagem");
const usuarioMensagem = document.getElementById("usuarioMensagem");
const editProdutoMensagem = document.getElementById("editProdutoMensagem");

const listaProdutos = document.getElementById("listaProdutos");
const listaUsuarios = document.getElementById("listaUsuarios");
const listaPedidos = document.getElementById("listaPedidos");
const listaPedidosAdmin = document.getElementById("listaPedidosAdmin");
const listaCarrinho = document.getElementById("listaCarrinho");

const totalProdutos = document.getElementById("totalProdutos");
const totalUsuarios = document.getElementById("totalUsuarios");
const totalPedidos = document.getElementById("totalPedidos");
const faturamentoTotal = document.getElementById("faturamentoTotal");
const totalCarrinho = document.getElementById("totalCarrinho");

const modalProduto = document.getElementById("modalProduto");
const areaAdmin = document.getElementById("areaAdmin");
const dashboardAdmin = document.getElementById("dashboardAdmin");

function atualizarTopo() {
  if (usuario) {
    usuarioLogado.textContent = `Logado: ${usuario.nome} (${usuario.email})`;
  } else {
    usuarioLogado.textContent = "Não logado";
  }

  const admin = usuario?.isAdmin;

  if (admin) {
    areaAdmin.classList.remove("oculto");
    dashboardAdmin.classList.remove("oculto");
  } else {
    areaAdmin.classList.add("oculto");
    dashboardAdmin.classList.add("oculto");
  }
}

function getHeaders() {
  return {
    Authorization: `Bearer ${token}`
  };
}

function getJsonHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

function salvarCarrinho() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  token = "";
  usuario = null;
  atualizarTopo();
  loginMensagem.textContent = "Logout realizado.";
  listarPedidos();
  listarUsuarios();
}

function abrirModalProduto(produto) {
  document.getElementById("editProdutoId").value = produto._id;
  document.getElementById("editProdutoNome").value = produto.nome || "";
  document.getElementById("editProdutoDescricao").value = produto.descricao || "";
  document.getElementById("editProdutoPreco").value = produto.preco || 0;
  document.getElementById("editProdutoCategoria").value = produto.categoria || "";
  document.getElementById("editProdutoEstoque").value = produto.estoque || 0;
  document.getElementById("editProdutoImagem").value = produto.imagem?.startsWith("/uploads/")
    ? ""
    : (produto.imagem || "");
  document.getElementById("editProdutoImagemArquivo").value = "";
  editProdutoMensagem.textContent = "";
  modalProduto.classList.remove("oculto");
}

function fecharModalProduto() {
  modalProduto.classList.add("oculto");
}

function classeStatus(status) {
  const mapa = {
    pendente: "status-pendente",
    aprovado: "status-aprovado",
    enviado: "status-enviado",
    entregue: "status-entregue"
  };

  return mapa[status] || "status-pendente";
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function imagemProdutoUrl(imagem) {
  if (!imagem || !imagem.trim()) {
    return "https://via.placeholder.com/400x300?text=Produto";
  }

  if (imagem.startsWith("/uploads/")) {
    return imagem;
  }

  return imagem;
}

function adicionarAoCarrinho(produto) {
  const itemExistente = carrinho.find((item) => item._id === produto._id);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({
      _id: produto._id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: 1
    });
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQuantidadeCarrinho(id, delta) {
  const item = carrinho.find((produto) => produto._id === id);
  if (!item) return;

  item.quantidade += delta;

  if (item.quantidade <= 0) {
    carrinho = carrinho.filter((produto) => produto._id !== id);
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
  listaCarrinho.innerHTML = "";

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = "<p>Carrinho vazio.</p>";
    totalCarrinho.textContent = formatarMoeda(0);
    return;
  }

  let total = 0;

  carrinho.forEach((item) => {
    total += item.preco * item.quantidade;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>${item.nome}</h3>
      <p><strong>Preço:</strong> ${formatarMoeda(item.preco)}</p>
      <p><strong>Quantidade:</strong> ${item.quantidade}</p>
      <div class="acoes">
        <button onclick="alterarQuantidadeCarrinho('${item._id}', 1)">+</button>
        <button class="btn-secundario" onclick="alterarQuantidadeCarrinho('${item._id}', -1)">-</button>
      </div>
    `;

    listaCarrinho.appendChild(div);
  });

  totalCarrinho.textContent = formatarMoeda(total);
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    const resposta = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      loginMensagem.textContent = dados.message || "Erro no login";
      return;
    }

    token = dados.token;
    usuario = dados.usuario;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));

    loginMensagem.textContent = "Login realizado com sucesso.";
    atualizarTopo();
    await carregarDashboard();
  } catch (error) {
    loginMensagem.textContent = "Erro ao fazer login.";
  }
});

document.getElementById("cadastroPublicoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("cadastroNome").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;

  try {
    const resposta = await fetch(`${API}/auth/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nome, email, senha, isAdmin: false })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      cadastroMensagem.textContent = dados.message || "Erro ao cadastrar";
      return;
    }

    cadastroMensagem.textContent = "Conta criada com sucesso. Agora faça login.";
    document.getElementById("cadastroPublicoForm").reset();
  } catch (error) {
    cadastroMensagem.textContent = "Erro ao criar conta.";
  }
});

if (document.getElementById("produtoForm")) {
  document.getElementById("produtoForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", document.getElementById("produtoNome").value);
    formData.append("descricao", document.getElementById("produtoDescricao").value);
    formData.append("preco", document.getElementById("produtoPreco").value);
    formData.append("categoria", document.getElementById("produtoCategoria").value);
    formData.append("estoque", document.getElementById("produtoEstoque").value || 0);
    formData.append("imagemUrl", document.getElementById("produtoImagem").value);

    const arquivo = document.getElementById("produtoImagemArquivo").files[0];
    if (arquivo) {
      formData.append("imagem", arquivo);
    }

    try {
      const resposta = await fetch(`${API}/produtos`, {
        method: "POST",
        headers: getHeaders(),
        body: formData
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        produtoMensagem.textContent = dados.message || "Erro ao cadastrar produto";
        return;
      }

      produtoMensagem.textContent = "Produto cadastrado com sucesso.";
      document.getElementById("produtoForm").reset();
      await carregarDashboard();
    } catch (error) {
      produtoMensagem.textContent = "Erro ao cadastrar produto.";
    }
  });
}

if (document.getElementById("usuarioForm")) {
  document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("usuarioNome").value;
    const email = document.getElementById("usuarioEmail").value;
    const senha = document.getElementById("usuarioSenha").value;
    const isAdmin = document.getElementById("usuarioAdmin").checked;

    try {
      const resposta = await fetch(`${API}/usuarios`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify({
          nome,
          email,
          senha,
          isAdmin
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        usuarioMensagem.textContent = dados.message || "Erro ao cadastrar cliente";
        return;
      }

      usuarioMensagem.textContent = "Cliente cadastrado com sucesso.";
      document.getElementById("usuarioForm").reset();
      await carregarDashboard();
    } catch (error) {
      usuarioMensagem.textContent = "Erro ao cadastrar cliente.";
    }
  });
}

document.getElementById("editarProdutoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editProdutoId").value;

  const formData = new FormData();
  formData.append("nome", document.getElementById("editProdutoNome").value);
  formData.append("descricao", document.getElementById("editProdutoDescricao").value);
  formData.append("preco", document.getElementById("editProdutoPreco").value);
  formData.append("categoria", document.getElementById("editProdutoCategoria").value);
  formData.append("estoque", document.getElementById("editProdutoEstoque").value || 0);
  formData.append("imagemUrl", document.getElementById("editProdutoImagem").value);

  const arquivo = document.getElementById("editProdutoImagemArquivo").files[0];
  if (arquivo) {
    formData.append("imagem", arquivo);
  }

  try {
    const resposta = await fetch(`${API}/produtos/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: formData
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      editProdutoMensagem.textContent = dados.message || "Erro ao editar produto";
      return;
    }

    fecharModalProduto();
    await carregarDashboard();
  } catch (error) {
    editProdutoMensagem.textContent = "Erro ao editar produto.";
  }
});

async function listarProdutos(termo = "") {
  try {
    const url = termo
      ? `${API}/produtos/buscar?nome=${encodeURIComponent(termo)}`
      : `${API}/produtos`;

    const resposta = await fetch(url);
    const produtos = await resposta.json();

    listaProdutos.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      listaProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
      totalProdutos.textContent = "0";
      return;
    }

    totalProdutos.textContent = produtos.length;

    produtos.forEach((produto) => {
      const div = document.createElement("div");
      div.className = "produto-card";

      const botoesAdmin = usuario?.isAdmin
        ? `
          <button onclick='abrirModalProduto(${JSON.stringify(produto).replace(/'/g, "&apos;")})'>Editar</button>
          <button class="btn-danger" onclick="excluirProduto('${produto._id}')">Excluir</button>
        `
        : "";

      div.innerHTML = `
        <img class="produto-imagem" src="${imagemProdutoUrl(produto.imagem)}" alt="${produto.nome}" />
        <div class="produto-corpo">
          <h3>${produto.nome}</h3>
          <p><strong>Categoria:</strong> ${produto.categoria}</p>
          <p><strong>Preço:</strong> ${formatarMoeda(produto.preco)}</p>
          <p><strong>Estoque:</strong> ${produto.estoque ?? 0}</p>
          <p><strong>Descrição:</strong> ${produto.descricao || "-"}</p>
          <div class="acoes">
            <button onclick='adicionarAoCarrinho(${JSON.stringify(produto).replace(/'/g, "&apos;")})'>Adicionar ao carrinho</button>
            ${botoesAdmin}
          </div>
        </div>
      `;

      listaProdutos.appendChild(div);
    });
  } catch (error) {
    listaProdutos.innerHTML = "<p>Erro ao carregar produtos.</p>";
  }
}

function buscarProdutos() {
  const termo = document.getElementById("buscaProduto").value.trim();
  listarProdutos(termo);
}

async function listarUsuarios() {
  if (!token || !usuario?.isAdmin) {
    listaUsuarios.innerHTML = "<p>Área disponível apenas para admin.</p>";
    totalUsuarios.textContent = "0";
    return;
  }

  try {
    const resposta = await fetch(`${API}/usuarios`, {
      headers: getJsonHeaders()
    });

    const usuarios = await resposta.json();

    if (!resposta.ok) {
      listaUsuarios.innerHTML = `<p>${usuarios.message || "Erro ao carregar clientes."}</p>`;
      totalUsuarios.textContent = "0";
      return;
    }

    listaUsuarios.innerHTML = "";

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      listaUsuarios.innerHTML = "<p>Nenhum cliente cadastrado.</p>";
      totalUsuarios.textContent = "0";
      return;
    }

    totalUsuarios.textContent = usuarios.length;

    usuarios.forEach((usuarioItem) => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <h3>${usuarioItem.nome}</h3>
        <p><strong>Email:</strong> ${usuarioItem.email}</p>
        <p><strong>Admin:</strong> ${usuarioItem.isAdmin ? "Sim" : "Não"}</p>
        <div class="acoes">
          <button class="btn-danger" onclick="excluirUsuario('${usuarioItem._id}')">Excluir</button>
        </div>
      `;

      listaUsuarios.appendChild(div);
    });
  } catch (error) {
    listaUsuarios.innerHTML = "<p>Erro ao carregar clientes.</p>";
    totalUsuarios.textContent = "0";
  }
}

function renderizarPedidosNoElemento(elemento, pedidos, admin = false) {
  elemento.innerHTML = "";

  if (!Array.isArray(pedidos) || pedidos.length === 0) {
    elemento.innerHTML = "<p>Nenhum pedido encontrado.</p>";
    return;
  }

  pedidos.forEach((pedido) => {
    const produtosHtml = (pedido.produtos || [])
      .map((item) => {
        const nomeProduto = item.produto?.nome || "Produto";
        const qtd = item.quantidade || 0;
        return `<p>- ${nomeProduto} x ${qtd}</p>`;
      })
      .join("");

    const acoesAdmin = admin
      ? `
        <div class="acoes">
          <button class="btn-aviso" onclick="alterarStatusPedido('${pedido._id}', 'aprovado')">Aprovar</button>
          <button onclick="alterarStatusPedido('${pedido._id}', 'enviado')">Enviar</button>
          <button class="btn-secundario" onclick="alterarStatusPedido('${pedido._id}', 'entregue')">Entregar</button>
        </div>
      `
      : "";

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <h3>Pedido #${pedido._id.slice(-6)}</h3>
      <p><strong>Cliente:</strong> ${pedido.usuario?.nome || "Sem nome"}</p>
      <p><strong>Email:</strong> ${pedido.usuario?.email || "-"}</p>
      <p><strong>Total:</strong> ${formatarMoeda(pedido.total)}</p>
      <p><strong>Produtos:</strong></p>
      ${produtosHtml}
      <span class="status ${classeStatus(pedido.status)}">${pedido.status}</span>
      ${acoesAdmin}
    `;

    elemento.appendChild(div);
  });
}

async function listarPedidos() {
  if (!token) {
    listaPedidos.innerHTML = "<p>Faça login para ver seus pedidos.</p>";
    listaPedidosAdmin.innerHTML = "<p>Faça login para ver os pedidos.</p>";
    totalPedidos.textContent = "0";
    faturamentoTotal.textContent = formatarMoeda(0);
    return;
  }

  try {
    const resposta = await fetch(`${API}/pedidos`, {
      headers: getJsonHeaders()
    });

    const pedidos = await resposta.json();

    if (!resposta.ok) {
      listaPedidos.innerHTML = `<p>${pedidos.message || "Erro ao carregar pedidos."}</p>`;
      listaPedidosAdmin.innerHTML = `<p>${pedidos.message || "Erro ao carregar pedidos."}</p>`;
      totalPedidos.textContent = "0";
      faturamentoTotal.textContent = formatarMoeda(0);
      return;
    }

    totalPedidos.textContent = pedidos.length;

    const total = pedidos.reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);
    faturamentoTotal.textContent = formatarMoeda(total);

    if (usuario?.isAdmin) {
      renderizarPedidosNoElemento(listaPedidosAdmin, pedidos, true);
      renderizarPedidosNoElemento(listaPedidos, pedidos, false);
    } else {
      renderizarPedidosNoElemento(listaPedidos, pedidos, false);
      listaPedidosAdmin.innerHTML = "<p>Área disponível apenas para admin.</p>";
    }
  } catch (error) {
    listaPedidos.innerHTML = "<p>Erro ao carregar pedidos.</p>";
    listaPedidosAdmin.innerHTML = "<p>Erro ao carregar pedidos.</p>";
  }
}

async function finalizarPedido() {
  if (!token) {
    alert("Faça login para finalizar o pedido.");
    return;
  }

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  try {
    const produtos = carrinho.map((item) => ({
      produto: item._id,
      quantidade: item.quantidade
    }));

    const resposta = await fetch(`${API}/pedidos`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify({ produtos })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.message || "Erro ao finalizar pedido");
      return;
    }

    alert("Pedido realizado com sucesso.");
    limparCarrinho();
    await listarPedidos();
  } catch (error) {
    alert("Erro ao finalizar pedido.");
  }
}

async function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto?")) return;

  try {
    const resposta = await fetch(`${API}/produtos/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.message || "Erro ao excluir produto");
      return;
    }

    await carregarDashboard();
  } catch (error) {
    alert("Erro ao excluir produto.");
  }
}

async function excluirUsuario(id) {
  if (!confirm("Deseja excluir este cliente?")) return;

  try {
    const resposta = await fetch(`${API}/usuarios/${id}`, {
      method: "DELETE",
      headers: getJsonHeaders()
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.message || "Erro ao excluir cliente");
      return;
    }

    await carregarDashboard();
  } catch (error) {
    alert("Erro ao excluir cliente.");
  }
}

async function alterarStatusPedido(id, status) {
  try {
    const resposta = await fetch(`${API}/pedidos/${id}/status`, {
      method: "PUT",
      headers: getJsonHeaders(),
      body: JSON.stringify({ status })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert(dados.message || "Erro ao atualizar status do pedido");
      return;
    }

    await listarPedidos();
  } catch (error) {
    alert("Erro ao atualizar status do pedido.");
  }
}

async function carregarDashboard() {
  await listarProdutos();
  await listarUsuarios();
  await listarPedidos();
  renderizarCarrinho();
}

atualizarTopo();
listarProdutos();
renderizarCarrinho();
if (token) {
  listarPedidos();
  if (usuario?.isAdmin) {
    listarUsuarios();
  }
}