// efectos.js - Utilidades de UI para VELORA

// ── TEMA CLARO / OSCURO ──────────────────────────────────────
function initTema() {
  const guardado = localStorage.getItem("velora_tema") || "oscuro";
  aplicarTema(guardado);
}

function toggleTema() {
  const actual = localStorage.getItem("velora_tema") || "oscuro";
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  aplicarTema(nuevo);
}

function aplicarTema(tema) {
  localStorage.setItem("velora_tema", tema);
  document.documentElement.setAttribute("data-tema", tema);
  // Actualizar botón si existe
  const btn = document.getElementById("btn-tema");
  if (btn) {
    const txt = window.t ? window.t() : null;
    btn.textContent = tema === "oscuro"
      ? (txt?.temaClaro || "☀️ Claro")
      : (txt?.temaOscuro || "🌙 Oscuro");
  }
}

// ── IDIOMA ───────────────────────────────────────────────────
function toggleIdioma() {
  const actual = window.VELORA_IDIOMA || "es";
  const nuevo = actual === "es" ? "en" : "es";
  window.VELORA_IDIOMA = nuevo;
  localStorage.setItem("velora_idioma", nuevo);
  location.reload(); // Recarga para aplicar el idioma
}

// ── MOSTRAR / OCULTAR FORMULARIOS (index.html) ───────────────
function mostrarLogin() {
  document.getElementById("login")?.classList.remove("oculto");
  document.getElementById("registro")?.classList.add("oculto");
  document.getElementById("otra")?.classList.add("oculto");
}

function mostrarRegistro() {
  document.getElementById("registro")?.classList.remove("oculto");
  document.getElementById("login")?.classList.add("oculto");
  document.getElementById("otra")?.classList.add("oculto");
}

function mostrarRecuperar() {
  document.getElementById("otra")?.classList.remove("oculto");
  document.getElementById("login")?.classList.add("oculto");
  document.getElementById("registro")?.classList.add("oculto");
}

// ── MODAL PERFIL ─────────────────────────────────────────────
function abrirPerfil() {
  const modal = document.getElementById("modal-perfil");
  if (modal) {
    modal.classList.remove("oculto");
    cargarDatosPerfil?.();
  }
}

function cerrarPerfil() {
  document.getElementById("modal-perfil")?.classList.add("oculto");
}

// ── MODAL CARRITO ─────────────────────────────────────────────
function abrirCarrito(planId, planNombre, planPrecio) {
  const modal = document.getElementById("modal-carrito");
  if (modal) {
    document.getElementById("carrito-plan-nombre").textContent = planNombre;
    document.getElementById("carrito-plan-precio").textContent =
      `COP ${Number(planPrecio).toLocaleString("es-CO")}`;
    modal.dataset.planId = planId;
    modal.dataset.planNombre = planNombre;
    modal.dataset.planPrecio = planPrecio;
    modal.classList.remove("oculto");
  }
}

function cerrarCarrito() {
  document.getElementById("modal-carrito")?.classList.add("oculto");
}

// ── FORMATO TARJETA ───────────────────────────────────────────
function formatearNumeroTarjeta(input) {
  let val = input.value.replace(/\D/g, "").substring(0, 16);
  input.value = val.replace(/(.{4})/g, "$1 ").trim();
}

function formatearExpiracion(input) {
  let val = input.value.replace(/\D/g, "").substring(0, 4);
  if (val.length >= 2) val = val.substring(0, 2) + "/" + val.substring(2);
  input.value = val;
}

// ── EXPORTAR ─────────────────────────────────────────────────
window.initTema = initTema;
window.toggleTema = toggleTema;
window.toggleIdioma = toggleIdioma;
window.mostrarLogin = mostrarLogin;
window.mostrarRegistro = mostrarRegistro;
window.mostrarRecuperar = mostrarRecuperar;
window.abrirPerfil = abrirPerfil;
window.cerrarPerfil = cerrarPerfil;
window.abrirCarrito = abrirCarrito;
window.cerrarCarrito = cerrarCarrito;
window.formatearNumeroTarjeta = formatearNumeroTarjeta;
window.formatearExpiracion = formatearExpiracion;

// Iniciar tema al cargar
document.addEventListener("DOMContentLoaded", initTema);