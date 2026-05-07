function mostrarRegistro() {
  document.getElementById("loginCard").classList.add("oculto");
  document.getElementById("registroCard").classList.remove("oculto");
}

function mostrarLogin() {
  document.getElementById("registroCard").classList.add("oculto");
  document.getElementById("loginCard").classList.remove("oculto");
}