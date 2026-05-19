// index.js - Autenticación VELORA

const supabaseClient = window.supabase.createClient(
  "https://ytdkmyotjzaissxfjjuu.supabase.co",
  "sb_publishable_6_4LFbvOzGUfsnGyhgQvjQ_2JCVJxlH"
);

// ── VERIFICAR SESIÓN ACTIVA AL CARGAR ─────────────────────────
// Si ya está logueado, redirigir según tenga plan o no
window.addEventListener("DOMContentLoaded", async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return; // No está logueado, mostrar formularios

  // Verificar si tiene plan activo
  const { data: perfil } = await supabaseClient
    .from("perfiles")
    .select("tipo_suscripcion, id_suscripcion")
    .eq("id", user.id)
    .maybeSingle();

  if (perfil?.id_suscripcion) {
    // Ya tiene plan → ir directamente a películas
    window.location.href = "peliculas.html";
  } else {
    // Tiene cuenta pero sin plan → ir a planes
    window.location.href = "planes.html";
  }
});

// ── LOGIN ──────────────────────────────────────────────────────
async function login() {
  const email = document.getElementById("emailLogin").value.trim();
  const password = document.getElementById("passwordLogin").value;

  if (!email || !password) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Error al iniciar sesión: " + error.message);
    return;
  }

  const user = data.user;
  const nombre = user.user_metadata?.nombre || "";
  const edad = user.user_metadata?.edad || null;

  // Crear perfil si no existe (primera vez)
  const { data: perfilExistente } = await supabaseClient
    .from("perfiles")
    .select("id, id_suscripcion")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfilExistente) {
    await supabaseClient.from("perfiles").insert([{
      id: user.id,
      email: user.email,
      nombre: nombre,
      edad: edad,
      tipo_suscripcion: "Pendiente"
    }]);
  }

  // Redirigir según plan
  if (perfilExistente?.id_suscripcion) {
    window.location.href = "peliculas.html";
  } else {
    window.location.href = "planes.html";
  }
}

// ── REGISTRO ───────────────────────────────────────────────────
async function registrar() {
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const nombre   = document.getElementById("nombre").value.trim();
  const edad     = document.getElementById("edad").value;

  if (!email || !password || !nombre) {
    alert("Por favor completa los campos obligatorios.");
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      // ← Cambia esto por tu URL local o deja vacío
      emailRedirectTo: "http://127.0.0.1:5501/planes.html",
      data: { nombre, edad }
    }
  });

  if (error) {
    alert("Error en registro: " + error.message);
  } else {
    alert("¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.");
    mostrarLogin();
  }
}

// ── RECUPERAR CONTRASEÑA ───────────────────────────────────────
async function recuperarPassword() {
  const email = document.getElementById("emailRecuperar").value.trim();
  if (!email) {
    alert("Por favor ingresa tu correo.");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://vanessacal06.github.io/streaming/reset.html"
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Si el correo está registrado, recibirás un enlace de recuperación.");
  }
}

// ── EXPORTAR ───────────────────────────────────────────────────
window.registrar        = registrar;
window.login            = login;
window.recuperarPassword = recuperarPassword;
window.supabaseClient   = supabaseClient; // disponible globalmente