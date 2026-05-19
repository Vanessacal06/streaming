// planes.js - VELORA

const supabaseClient = window.supabase.createClient(
  "https://ytdkmyotjzaissxfjjuu.supabase.co",
  "sb_publishable_6_4LFbvOzGUfsnGyhgQvjQ_2JCVJxlH"
);
window.supabaseClient = supabaseClient;

// ── CARGAR PLANES ─────────────────────────────────────────────
async function cargarPlanes() {
  const { data: planes, error } = await supabaseClient
    .from("suscripciones")
    .select("*")
    .order("precio", { ascending: true });

  if (error) {
    console.error("Error al cargar planes:", error.message);
    return;
  }

  const contenedor = document.getElementById("planes");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  const txt = window.t();
  const MONEDAS = window.MONEDAS_GLOBAL;
  
  // Obtener región actual
  const region = window.obtenerRegion ? window.obtenerRegion() : (window.VELORA_REGION || localStorage.getItem("velora_region") || "CO");
  const moneda = MONEDAS[region] || MONEDAS["CO"];

  console.log("Cargando planes — Región:", region, "Moneda:", moneda.nombre);

  planes.forEach(plan => {
    const card = document.createElement("section");
    card.classList.add("plan-card");

    const isPremium = plan.nombre.toLowerCase().includes("premium");
    const isEstandar = plan.nombre.toLowerCase().includes("estándar") ||
                       plan.nombre.toLowerCase().includes("estandar");

    let features = "";
    if (plan.nombre.toLowerCase().includes("básico") || plan.nombre.toLowerCase().includes("basico")) {
      features = `<li>1 pantalla</li><li>Calidad HD</li><li>Catálogo general</li><li>Sin anuncios</li>`;
    } else if (isEstandar) {
      features = `<li>2 pantallas</li><li>Full HD</li><li>Más series y películas</li><li>Sin anuncios</li><li>Multidispositivo</li>`;
    } else {
      features = `<li>4 pantallas</li><li>Ultra HD 4K</li><li>Todo el catálogo</li><li>Sin anuncios</li><li>Multidispositivo</li><li>Contenido exclusivo</li>`;
    }

    const precioLocal = Math.round(Number(plan.precio) * moneda.tasa);
    const soloNumero = new Intl.NumberFormat(moneda.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precioLocal);

    card.innerHTML = `
      ${isPremium ? '<span class="badge">TOP</span>' : ''}
      <h3>${plan.nombre}</h3>
      <div class="price">
        <span class="currency">${moneda.nombre}</span>
        <span class="number">${soloNumero}</span>
        <span class="month">/mes</span>
      </div>
      <ul class="features">${features}</ul>
      <button class="btn-plan" onclick="seleccionarPlan(${plan.id}, '${plan.nombre}', ${precioLocal})">
        ${txt.activarPlan || "🚀 ACTIVAR PLAN"}
      </button>
    `;
    contenedor.appendChild(card);
  });
}

// ── SELECCIONAR PLAN ─────────────────────────────────────────
async function seleccionarPlan(idPlan, nombrePlan, precio) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "index.html";
    return;
  }
  window.abrirCarrito(idPlan, nombrePlan, precio);
}

// ── PROCESAR PAGO ─────────────────────────────────────────────
async function procesarPago() {
  const txt = window.t();
  const nombre  = document.getElementById("pago-nombre").value.trim();
  const numero  = document.getElementById("pago-numero").value.replace(/\s/g, "");
  const exp     = document.getElementById("pago-exp").value.trim();
  const cvv     = document.getElementById("pago-cvv").value.trim();

  if (!nombre || numero.length < 12 || exp.length < 4 || cvv.length < 3) {
    alert(txt.camposRequeridos || "Por favor completa todos los campos de pago.");
    return;
  }

  const modal = document.getElementById("modal-carrito");
  const idPlan     = modal.dataset.planId;
  const nombrePlan = modal.dataset.planNombre;

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { alert("Sesión expirada."); return; }

  const ultimos4 = numero.slice(-4);

  const { error } = await supabaseClient
    .from("perfiles")
    .update({
      id_suscripcion: parseInt(idPlan),
      tipo_suscripcion: nombrePlan,
      tarjeta_ultimos4: ultimos4,
      updated_at: new Date().toISOString()
    })
    .eq("id", user.id);

  if (error) {
    alert("Error al activar el plan: " + error.message);
    return;
  }

  alert(txt.pagoExitoso || "¡Pago simulado exitoso! Plan activado ✅");
  cerrarCarrito();
  window.location.href = "peliculas.html";
}

// ── CARGAR DATOS DE PERFIL ────────────────────────────────────
async function cargarDatosPerfil() {
  const txt = window.t();
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data: perfil } = await supabaseClient
    .from("perfiles").select("*").eq("id", user.id).maybeSingle();

  const contenido = document.getElementById("perfil-contenido");
  if (!contenido) return;

  if (!perfil) {
    contenido.innerHTML = "<p>No se encontró perfil.</p>";
    return;
  }

  const plan = perfil.tipo_suscripcion || txt.sinPlan;
  const tarjeta = perfil.tarjeta_ultimos4
    ? `•••• •••• •••• ${perfil.tarjeta_ultimos4}`
    : txt.sinTarjeta;

  contenido.innerHTML = `
    <div class="perfil-dato"><span>${txt.nombre || "Nombre"}</span><span>${perfil.nombre || "—"}</span></div>
    <div class="perfil-dato"><span>Email</span><span>${perfil.email || user.email}</span></div>
    <div class="perfil-dato"><span>${txt.planActivo || "Plan activo"}</span><span>${plan}</span></div>
    <div class="perfil-dato"><span>${txt.tarjetaGuardada || "Tarjeta guardada"}</span><span>${tarjeta}</span></div>
    ${perfil.id_suscripcion ? `<div class="badge-plan">${plan}</div>` : ""}
  `;
}

window.cargarDatosPerfil = cargarDatosPerfil;
window.cargarPlanes = cargarPlanes;
window.seleccionarPlan = seleccionarPlan;
window.procesarPago = procesarPago;

document.addEventListener("DOMContentLoaded", cargarPlanes);

// ← Recargar planes cuando cambie la región
window.addEventListener('regionCambiada', () => {
  console.log("Región cambiada — recargando planes...");
  cargarPlanes();
});

// ← También cuando se detecte automáticamente
window.addEventListener('regionDetectada', () => {
  const selector = document.getElementById("selector-region");
  if (selector) selector.value = window.VELORA_REGION;
  cargarPlanes();
});