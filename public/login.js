const mensagem = document.getElementById("mensagem");

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const resposta = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    mensagem.textContent = dados.message || "Erro no login";
    return;
  }

  localStorage.setItem("token", dados.token);
  localStorage.setItem("usuario", JSON.stringify(dados.usuario));

  if (dados.usuario.isAdmin) {
    window.location.href = "/admin.html";
  } else {
    window.location.href = "/index.html";
  }
});

document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nomeCadastro").value;
  const email = document.getElementById("emailCadastro").value;
  const senha = document.getElementById("senhaCadastro").value;

  const resposta = await fetch("/auth/registrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, isAdmin: false })
  });

  const dados = await resposta.json();

  mensagem.textContent = resposta.ok
    ? "Conta criada com sucesso. Agora faça login."
    : (dados.message || "Erro ao criar conta");
});