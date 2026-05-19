// efectos.js - Utilidades de UI para VELORA

// ── MAPA DE MONEDAS GLOBAL ────────────────────────────────────
const MONEDAS_GLOBAL = {
  CO: { nombre: "COP", locale: "es-CO", tasa: 1 },
  US: { nombre: "USD", locale: "en-US", tasa: 0.00025 },
  MX: { nombre: "MXN", locale: "es-MX", tasa: 0.0045 },
  AR: { nombre: "ARS", locale: "es-AR", tasa: 250 },
  CL: { nombre: "CLP", locale: "es-CL", tasa: 0.19 },
  ES: { nombre: "EUR", locale: "es-ES", tasa: 0.00023 },
  PE: { nombre: "PEN", locale: "es-PE", tasa: 0.00095 },
  EC: { nombre: "USD", locale: "en-US", tasa: 0.00025 },
  BR: { nombre: "BRL", locale: "pt-BR", tasa: 0.0013 }
};

// ── OBTENER REGIÓN ACTUAL ────────────────────────────────────
function obtenerRegion() {
  return window.VELORA_REGION || localStorage.getItem("velora_region") || "CO";
}

// ── CAMBIAR REGIÓN MANUALMENTE ────────────────────────────────
function cambiarRegion(nuevaRegion) {
  window.VELORA_REGION = nuevaRegion;
  localStorage.setItem("velora_region", nuevaRegion);
  
  // Actualizar indicador visual
  actualizarIndicadorUbicacion();
  
  // Actualizar selector si existe
  const selector = document.getElementById("selector-region");
  if (selector) selector.value = nuevaRegion;
  
  // Disparar evento para que planes y películas se actualicen
  window.dispatchEvent(new CustomEvent('regionCambiada', { detail: { region: nuevaRegion } }));
  
  console.log("Región cambiada a:", nuevaRegion, "→ Moneda:", (MONEDAS_GLOBAL[nuevaRegion] || MONEDAS_GLOBAL["CO"]).nombre);
}

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
  location.reload();
}

// ── FORMULARIOS ──────────────────────────────────────────────
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
    
    const region = obtenerRegion();
    const moneda = MONEDAS_GLOBAL[region] || MONEDAS_GLOBAL["CO"];
    const precioFormateado = new Intl.NumberFormat(moneda.locale, {
      style: 'currency', currency: moneda.nombre,
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(Number(planPrecio));
    
    document.getElementById("carrito-plan-precio").textContent = precioFormateado;
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

// ── INDICADOR VISUAL DE UBICACIÓN ────────────────────────────
function actualizarIndicadorUbicacion() {
  const region = obtenerRegion();
  const el = document.getElementById("region-indicator");
  if (el) {
    const codePoints = region.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
    const flag = String.fromCodePoint(...codePoints);
    el.textContent = `${flag} ${region}`;
    el.title = `Región: ${region}`;
  }
}


// ── APLICAR IDIOMA A TODA LA PÁGINA ──────────────────────────
function aplicarIdioma() {
  const txt = window.t();
  if (!txt) return;

  // 1. Traducir textos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (txt[key] !== undefined) el.innerHTML = txt[key];
  });

  // 2. Traducir placeholders con data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (txt[key] !== undefined) el.placeholder = txt[key];
  });

  // 3. Cambiar el atributo lang del HTML
  document.documentElement.lang = window.VELORA_IDIOMA;
  
  // 4. Actualizar botón de idioma si existe
  const idiomaBtn = document.getElementById("txt-idioma-btn");
  if (idiomaBtn) idiomaBtn.textContent = window.VELORA_IDIOMA === "es" ? "EN" : "ES";
}
window.aplicarIdioma = aplicarIdioma;

// Llamar la función al cargar la página
document.addEventListener("DOMContentLoaded", aplicarIdioma);

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
window.actualizarIndicadorUbicacion = actualizarIndicadorUbicacion;
window.cambiarRegion = cambiarRegion;
window.obtenerRegion = obtenerRegion;
window.MONEDAS_GLOBAL = MONEDAS_GLOBAL;

document.addEventListener("DOMContentLoaded", initTema);