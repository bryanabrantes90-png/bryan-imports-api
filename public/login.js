const form = document.getElementById("login-form");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const resposta = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      mensagem.textContent = dados.message || "Erro no login";
      mensagem.style.color = "red";
      return;
    }

    localStorage.setItem("token", dados.token);
    localStorage.setItem("usuario", JSON.stringify(dados.usuario));

    mensagem.textContent = "Login realizado com sucesso!";
    mensagem.style.color = "green";

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  } catch (error) {
    mensagem.textContent = "Erro ao conectar com o servidor.";
    mensagem.style.color = "red";
    console.error(error);
  }
});