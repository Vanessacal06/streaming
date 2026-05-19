// calificaciones.js - Tarea Jira: tabla calificaciones + CRUD

// Supabase se inicializa en index.js / peliculas.js
// Esta función usa el supabaseClient global

// ── CALIFICAR PELÍCULA ────────────────────────────────────────
async function calificar(idTmdb) {
  const txt = window.t?.() || {};

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    alert("Debes iniciar sesión para calificar.");
    return;
  }

  // Pedir puntuación y comentario
  const estrellas = prompt(`${txt.estrellas || "Estrellas"} (1-5):`);
  if (!estrellas || isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
    alert("Por favor ingresa un número entre 1 y 5.");
    return;
  }
  const comentario = prompt(txt.tuComentario || "Tu comentario (opcional):") || "";

  // Insertar en Supabase
  const { error } = await supabaseClient.from("calificaciones").insert([{
    usuario_id: user.id,
    pelicula_id: idTmdb,
    id_tmdb: idTmdb,
    puntuacion: parseInt(estrellas),
    comentario: comentario
  }]);

  if (error) {
    if (error.code === "23505") {
      // Violación unique → ya calificó
      alert("Ya calificaste esta película. ¡Solo se permite una calificación por película!");
    } else {
      console.error("Error al calificar:", error.message);
      alert("Error al guardar tu calificación: " + error.message);
    }
    return;
  }

  alert(txt.graciasCalif || "¡Gracias por tu calificación!");

  // Refrescar la tarjeta con el nuevo promedio si es posible
  await mostrarPromedioEnCard(idTmdb);
}

// ── OBTENER PROMEDIO DE UNA PELÍCULA ─────────────────────────
async function obtenerPromedio(idTmdb) {
  const { data, error } = await supabaseClient
    .from("calificaciones")
    .select("puntuacion")
    .eq("id_tmdb", idTmdb);

  if (error || !data || data.length === 0) return null;

  const suma = data.reduce((acc, r) => acc + r.puntuacion, 0);
  return (suma / data.length).toFixed(1);
}

// ── MOSTRAR PROMEDIO EN LA TARJETA ────────────────────────────
async function mostrarPromedioEnCard(idTmdb) {
  const promedio = await obtenerPromedio(idTmdb);
  if (!promedio) return;
  const span = document.getElementById(`promedio-${idTmdb}`);
  if (span) span.textContent = `⭐ ${promedio} (usuarios)`;
}

// ── CARGAR TODOS LOS PROMEDIOS ────────────────────────────────
// Llama esto después de renderizar las tarjetas
async function cargarPromedios(listaTmdbIds) {
  for (const id of listaTmdbIds) {
    await mostrarPromedioEnCard(id);
  }
}

// Exportar
window.calificar = calificar;
window.obtenerPromedio = obtenerPromedio;
window.cargarPromedios = cargarPromedios;