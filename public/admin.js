const token = localStorage.getItem("token");

if (!token) {
  alert("Faça login primeiro.");
  window.location.href = "login.html";
}

const produtoForm = document.getElementById("produto-form");
const clienteForm = document.getElementById("cliente-form");

const produtoIdInput = document.getElementById("produto-id");
const nomeInput = document.getElementById("nome");
const categoriaInput = document.getElementById("categoria");
const descricaoInput = document.getElementById("descricao");
const precoInput = document.getElementById("preco");
const estoqueInput = document.getElementById("estoque");
const imagemInput = document.getElementById("imagem");
const arquivoImagemInput = document.getElementById("arquivo-imagem");
const previewImagem = document.getElementById("preview-imagem");

const produtoMsg = document.getElementById("produto-msg");
const clienteMsg = document.getElementById("cliente-msg");

const tabelaProdutos = document.getElementById("tabela-produtos");
const tabelaClientes = document.getElementById("tabela-clientes");

const btnSalvarProduto = document.getElementById("btn-salvar-produto");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

function irParaLoja() {
  window.location.href = "index.html";
}

function mostrarMensagem(elemento, texto, cor = "green") {
  elemento.textContent = texto;
  elemento.style.color = cor;
}

function limparMensagem(elemento) {
  elemento.textContent = "";
}

function montarUrlImagem(imagem) {
  if (!imagem || imagem.trim() === "") {
    return "https://via.placeholder.com/120x120?text=Sem+Imagem";
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

function setPreviewImagem(src) {
  const url = montarUrlImagem(src);

  if (!src || src.trim() === "") {
    previewImagem.src = "";
    previewImagem.classList.add("oculto");
    return;
  }

  previewImagem.src = url;
  previewImagem.classList.remove("oculto");
}

function limparFormularioProduto() {
  produtoForm.reset();
  produtoIdInput.value = "";
  btnSalvarProduto.textContent = "Salvar Produto";
  arquivoImagemInput.value = "";
  setPreviewImagem("");
  limparMensagem(produtoMsg);
}

async function fazerUploadImagem(arquivo) {
  const formData = new FormData();
  formData.append("imagem", arquivo);

  const resposta = await fetch("/api/produtos/upload/imagem", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.message || "Erro ao enviar imagem");
  }

  return dados.imagem;
}

arquivoImagemInput.addEventListener("change", async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  try {
    mostrarMensagem(produtoMsg, "Enviando imagem...", "#374151");
    const caminhoImagem = await fazerUploadImagem(arquivo);
    imagemInput.value = caminhoImagem;
    setPreviewImagem(caminhoImagem);
    mostrarMensagem(produtoMsg, "Imagem enviada com sucesso!", "green");
  } catch (error) {
    mostrarMensagem(produtoMsg, error.message, "red");
    console.error(error);
  }
});

imagemInput.addEventListener("input", () => {
  setPreviewImagem(imagemInput.value.trim());
});

btnCancelarEdicao.addEventListener("click", () => {
  limparFormularioProduto();
});

async function carregarProdutos() {
  try {
    const resposta = await fetch("/api/produtos");
    const produtos = await resposta.json();

    tabelaProdutos.innerHTML = "";

    if (!Array.isArray(produtos) || produtos.length === 0) {
      tabelaProdutos.innerHTML = `
        <tr>
          <td colspan="6">Nenhum produto cadastrado.</td>
        </tr>
      `;
      return;
    }

    produtos.forEach((produto) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <img
            src="${montarUrlImagem(produto.imagem)}"
            alt="${produto.nome}"
            class="thumb-tabela"
            onerror="this.src='https://via.placeholder.com/120x120?text=Sem+Imagem'"
          />
        </td>
        <td>${produto.nome}</td>
        <td>${produto.categoria || "-"}</td>
        <td>R$ ${Number(produto.preco).toFixed(2)}</td>
        <td>${produto.estoque ?? 0}</td>
        <td>
          <div class="acoes-tabela">
            <button class="btn-secundario" data-acao="editar">Editar</button>
            <button class="btn-perigo" data-acao="excluir">Excluir</button>
          </div>
        </td>
      `;

      const btnEditar = tr.querySelector('[data-acao="editar"]');
      const btnExcluir = tr.querySelector('[data-acao="excluir"]');

      btnEditar.addEventListener("click", () => preencherFormularioEdicao(produto));
      btnExcluir.addEventListener("click", () => excluirProduto(produto._id, produto.nome));

      tabelaProdutos.appendChild(tr);
    });
  } catch (error) {
    tabelaProdutos.innerHTML = `
      <tr>
        <td colspan="6">Erro ao carregar produtos.</td>
      </tr>
    `;
    console.error(error);
  }
}

function preencherFormularioEdicao(produto) {
  produtoIdInput.value = produto._id;
  nomeInput.value = produto.nome || "";
  categoriaInput.value = produto.categoria || "";
  descricaoInput.value = produto.descricao || "";
  precoInput.value = produto.preco ?? "";
  estoqueInput.value = produto.estoque ?? 0;
  imagemInput.value = produto.imagem || "";
  arquivoImagemInput.value = "";
  setPreviewImagem(produto.imagem || "");
  btnSalvarProduto.textContent = "Atualizar Produto";
  window.scrollTo({ top: 0, behavior: "smooth" });
  mostrarMensagem(produtoMsg, "Modo edição ativado.", "#374151");
}

async function excluirProduto(id, nome) {
  const confirmar = confirm(`Deseja excluir o produto "${nome}"?`);
  if (!confirmar) return;

  try {
    const resposta = await fetch(`/api/produtos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(produtoMsg, dados.message || "Erro ao excluir produto.", "red");
      return;
    }

    mostrarMensagem(produtoMsg, "Produto excluído com sucesso!", "green");
    carregarProdutos();
    limparFormularioProduto();
  } catch (error) {
    mostrarMensagem(produtoMsg, "Erro ao conectar com o servidor.", "red");
    console.error(error);
  }
}

produtoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = produtoIdInput.value.trim();

  const payload = {
    nome: nomeInput.value.trim(),
    categoria: categoriaInput.value.trim(),
    descricao: descricaoInput.value.trim(),
    preco: Number(precoInput.value),
    estoque: Number(estoqueInput.value),
    imagem: imagemInput.value.trim()
  };

  try {
    const url = id ? `/api/produtos/${id}` : "/api/produtos";
    const metodo = id ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(produtoMsg, dados.message || "Erro ao salvar produto.", "red");
      return;
    }

    mostrarMensagem(
      produtoMsg,
      id ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
      "green"
    );

    limparFormularioProduto();
    carregarProdutos();
  } catch (error) {
    mostrarMensagem(produtoMsg, "Erro ao conectar com o servidor.", "red");
    console.error(error);
  }
});

async function carregarClientes() {
  try {
    const resposta = await fetch("/api/usuarios", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const clientes = await resposta.json();

    tabelaClientes.innerHTML = "";

    if (!Array.isArray(clientes) || clientes.length === 0) {
      tabelaClientes.innerHTML = `
        <tr>
          <td colspan="3">Nenhum cliente encontrado.</td>
        </tr>
      `;
      return;
    }

    clientes.forEach((cliente) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.email}</td>
        <td>${cliente.tipo}</td>
      `;

      tabelaClientes.appendChild(tr);
    });
  } catch (error) {
    tabelaClientes.innerHTML = `
      <tr>
        <td colspan="3">Erro ao carregar clientes.</td>
      </tr>
    `;
    console.error(error);
  }
}

clienteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nome: document.getElementById("cliente-nome").value.trim(),
    email: document.getElementById("cliente-email").value.trim(),
    senha: document.getElementById("cliente-senha").value.trim(),
    tipo: "cliente"
  };

  try {
    const resposta = await fetch("/api/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mostrarMensagem(clienteMsg, dados.message || "Erro ao criar cliente.", "red");
      return;
    }

    mostrarMensagem(clienteMsg, "Cliente criado com sucesso!", "green");
    clienteForm.reset();
    carregarClientes();
  } catch (error) {
    mostrarMensagem(clienteMsg, "Erro ao conectar com o servidor.", "red");
    console.error(error);
  }
});

carregarProdutos();
carregarClientes();