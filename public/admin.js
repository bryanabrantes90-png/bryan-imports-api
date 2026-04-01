const token = localStorage.getItem("token") || "";
const usuario = JSON.parse(localStorage.getItem("usuario")) || null;

if (!token || !usuario?.isAdmin) {
  window.location.href = "/login.html";
}

document.getElementById("usuarioLogado").textContent =
  `Logado: ${usuario.nome} (${usuario.email})`;

let graficoPedidos = null;
let graficoCategorias = null;
let cacheProdutos = [];
let cachePedidos = [];
let imagemAtualProduto = "";

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("carrinho");
  window.location.href = "/login.html";
}

function definirPreview(imgId, src) {
  const img = document.getElementById(imgId);

  if (src) {
    img.src = src;
    img.classList.remove("oculto");
  } else {
    img.src = "";
    img.classList.add("oculto");
  }
}

function previewArquivo(inputId, previewId) {
  const input = document.getElementById(inputId);
  const arquivo = input.files[0];

  if (!arquivo) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    definirPreview(previewId, e.target.result);
  };
  reader.readAsDataURL(arquivo);
}

document.getElementById("produtoImagemArquivo").addEventListener("change", () => {
  previewArquivo("produtoImagemArquivo", "previewCadastro");
});

document.getElementById("produtoImagemUrl").addEventListener("input", (e) => {
  const valor = e.target.value.trim();
  definirPreview("previewCadastro", valor || "");
});

document.getElementById("editProdutoImagemArquivo").addEventListener("change", () => {
  document.getElementById("editRemoverImagem").checked = false;
  previewArquivo("editProdutoImagemArquivo", "previewEdicao");
});

document.getElementById("editProdutoImagemUrl").addEventListener("input", (e) => {
  const valor = e.target.value.trim();
  document.getElementById("editRemoverImagem").checked = false;
  definirPreview("previewEdicao", valor || "");
});

document.getElementById("editRemoverImagem").addEventListener("change", (e) => {
  if (e.target.checked) {
    document.getElementById("editProdutoImagemArquivo").value = "";
    document.getElementById("editProdutoImagemUrl").value = "";
    definirPreview("previewEdicao", "");
  } else {
    if (imagemAtualProduto) {
      definirPreview("previewEdicao", imagemAtualProduto);
    }
  }
});

function abrirModalProduto(produto) {
  document.getElementById("editProdutoId").value = produto._id;
  document.getElementById("editProdutoNome").value = produto.nome || "";
  document.getElementById("editProdutoDescricao").value = produto.descricao || "";
  document.getElementById("editProdutoPreco").value = produto.preco || 0;
  document.getElementById("editProdutoCategoria").value = produto.categoria || "";
  document.getElementById("editProdutoEstoque").value = produto.estoque || 0;
  document.getElementById("editProdutoImagemUrl").value =
    produto.imagem && !produto.imagem.startsWith("/uploads/") ? produto.imagem : "";
  document.getElementById("editProdutoImagemArquivo").value = "";
  document.getElementById("editRemoverImagem").checked = false;
  document.getElementById("editProdutoMensagem").textContent = "";

  imagemAtualProduto = produto.imagem || "";
  definirPreview("previewEdicao", imagemAtualProduto);

  document.getElementById("modalProduto").classList.remove("oculto");
}

function fecharModalProduto() {
  document.getElementById("modalProduto").classList.add("oculto");
}

function atualizarGraficoPedidos(pedidos) {
  const contagem = {
    pendente: 0,
    aprovado: 0,
    enviado: 0,
    entregue: 0
  };

  pedidos.forEach((pedido) => {
    if (contagem[pedido.status] !== undefined) {
      contagem[pedido.status] += 1;
    }
  });

  const ctx = document.getElementById("graficoPedidosStatus");

  if (graficoPedidos) graficoPedidos.destroy();

  graficoPedidos = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Pendente", "Aprovado", "Enviado", "Entregue"],
      datasets: [
        {
          label: "Pedidos",
          data: [
            contagem.pendente,
            contagem.aprovado,
            contagem.enviado,
            contagem.entregue
          ]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function atualizarGraficoCategorias(produtos) {
  const categorias = {};

  produtos.forEach((produto) => {
    const categoria = produto.categoria || "Sem categoria";
    categorias[categoria] = (categorias[categoria] || 0) + 1;
  });

  const ctx = document.getElementById("graficoProdutosCategoria");

  if (graficoCategorias) graficoCategorias.destroy();

  graficoCategorias = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categorias),
      datasets: [
        {
          label: "Produtos",
          data: Object.values(categorias)
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

async function listarProdutos() {
  const resposta = await fetch("/produtos");
  const produtos = await resposta.json();
  cacheProdutos = Array.isArray(produtos) ? produtos : [];

  const lista = document.getElementById("listaProdutos");
  const totalProdutos = document.getElementById("totalProdutos");

  lista.innerHTML = "";
  totalProdutos.textContent = cacheProdutos.length;

  cacheProdutos.forEach((produto) => {
    const imagemHtml = produto.imagem
      ? `<p><strong>Imagem:</strong><br><img src="${produto.imagem}" alt="${produto.nome}" style="max-width:120px;margin-top:8px;border-radius:10px;"></p>`
      : `<p><strong>Imagem:</strong> Sem imagem</p>`;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h3>${produto.nome}</h3>
      <p><strong>Categoria:</strong> ${produto.categoria}</p>
      <p><strong>Preço:</strong> ${formatarMoeda(produto.preco)}</p>
      <p><strong>Estoque:</strong> ${produto.estoque}</p>
      ${imagemHtml}
      <div class="acoes">
        <button onclick='abrirModalProduto(${JSON.stringify(produto).replace(/'/g, "&apos;")})'>Editar</button>
        <button class="btn-danger" onclick="excluirProduto('${produto._id}')">Excluir</button>
      </div>
    `;
    lista.appendChild(div);
  });

  atualizarGraficoCategorias(cacheProdutos);
}

async function listarUsuarios() {
  const resposta = await fetch("/usuarios", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const usuarios = await resposta.json();
  const lista = document.getElementById("listaUsuarios");
  const totalUsuarios = document.getElementById("totalUsuarios");

  const dados = Array.isArray(usuarios) ? usuarios : [];
  lista.innerHTML = "";
  totalUsuarios.textContent = dados.length;

  dados.forEach((usuarioItem) => {
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
    lista.appendChild(div);
  });
}

async function listarPedidos() {
  const resposta = await fetch("/pedidos", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const pedidos = await resposta.json();
  cachePedidos = Array.isArray(pedidos) ? pedidos : [];

  const lista = document.getElementById("listaPedidos");
  const totalPedidos = document.getElementById("totalPedidos");
  const faturamentoTotal = document.getElementById("faturamentoTotal");

  lista.innerHTML = "";
  totalPedidos.textContent = cachePedidos.length;

  const total = cachePedidos.reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);
  faturamentoTotal.textContent = formatarMoeda(total);

  cachePedidos.forEach((pedido) => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <h3>Pedido #${pedido._id.slice(-6)}</h3>
      <p><strong>Cliente:</strong> ${pedido.usuario?.nome || "-"}</p>
      <p><strong>Total:</strong> ${formatarMoeda(pedido.total)}</p>
      <p><strong>Status:</strong> ${pedido.status}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>
      <p><strong>Telefone:</strong> ${pedido.telefone}</p>
      <div class="acoes">
        <button class="btn-aviso" onclick="alterarStatus('${pedido._id}', 'aprovado')">Aprovar</button>
        <button onclick="alterarStatus('${pedido._id}', 'enviado')">Enviar</button>
        <button class="btn-secundario" onclick="alterarStatus('${pedido._id}', 'entregue')">Entregar</button>
      </div>
    `;
    lista.appendChild(div);
  });

  atualizarGraficoPedidos(cachePedidos);
}

async function excluirProduto(id) {
  await fetch(`/produtos/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  await listarProdutos();
}

async function excluirUsuario(id) {
  await fetch(`/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  await listarUsuarios();
}

async function alterarStatus(id, status) {
  await fetch(`/pedidos/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });

  await listarPedidos();
}

document.getElementById("produtoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("nome", document.getElementById("produtoNome").value);
  formData.append("descricao", document.getElementById("produtoDescricao").value);
  formData.append("preco", document.getElementById("produtoPreco").value);
  formData.append("categoria", document.getElementById("produtoCategoria").value);
  formData.append("estoque", document.getElementById("produtoEstoque").value || 0);
  formData.append("imagemUrl", document.getElementById("produtoImagemUrl").value);

  const arquivo = document.getElementById("produtoImagemArquivo").files[0];
  if (arquivo) {
    formData.append("imagem", arquivo);
  }

  const resposta = await fetch("/produtos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const dados = await resposta.json();
  document.getElementById("produtoMensagem").textContent =
    resposta.ok ? "Produto cadastrado com sucesso." : (dados.message || "Erro ao cadastrar produto");

  if (resposta.ok) {
    document.getElementById("produtoForm").reset();
    definirPreview("previewCadastro", "");
    await listarProdutos();
  }
});

document.getElementById("usuarioForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const resposta = await fetch("/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nome: document.getElementById("usuarioNome").value,
      email: document.getElementById("usuarioEmail").value,
      senha: document.getElementById("usuarioSenha").value,
      isAdmin: document.getElementById("usuarioAdmin").checked
    })
  });

  const dados = await resposta.json();
  document.getElementById("usuarioMensagem").textContent =
    resposta.ok ? "Cliente cadastrado com sucesso." : (dados.message || "Erro ao cadastrar cliente");

  if (resposta.ok) {
    document.getElementById("usuarioForm").reset();
    await listarUsuarios();
  }
});

document.getElementById("editarProdutoForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("editProdutoId").value;

  const formData = new FormData();
  formData.append("nome", document.getElementById("editProdutoNome").value);
  formData.append("descricao", document.getElementById("editProdutoDescricao").value);
  formData.append("preco", document.getElementById("editProdutoPreco").value);
  formData.append("categoria", document.getElementById("editProdutoCategoria").value);
  formData.append("estoque", document.getElementById("editProdutoEstoque").value || 0);
  formData.append("imagemUrl", document.getElementById("editProdutoImagemUrl").value);
  formData.append("removerImagem", document.getElementById("editRemoverImagem").checked);

  const arquivo = document.getElementById("editProdutoImagemArquivo").files[0];
  if (arquivo) {
    formData.append("imagem", arquivo);
  }

  const resposta = await fetch(`/produtos/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const dados = await resposta.json();
  document.getElementById("editProdutoMensagem").textContent =
    resposta.ok ? "Produto atualizado com sucesso." : (dados.message || "Erro ao atualizar produto");

  if (resposta.ok) {
    fecharModalProduto();
    await listarProdutos();
  }
});

listarProdutos();
listarUsuarios();
listarPedidos();