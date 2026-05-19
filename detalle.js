// detalle.js - VELORA Detalle de Película

let peliculaId = null;
let puntuacionSeleccionada = 0;

// ── AL CARGAR LA PÁGINA ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  // Obtener ID de la URL
  const params = new URLSearchParams(window.location.search);
  peliculaId = params.get("id");

  if (!peliculaId) {
    window.location.href = "peliculas.html";
    return;
  }

  await cargarDetallePelicula();
  await cargarComentarios();
  iniciarEstrellasUI();
});

// ── CARGAR DETALLE Y TRAILER ─────────────────────────────────
async function cargarDetallePelicula() {
  try {
    // Fetch detalle
    const respDetalle = await fetch(`https://api.themoviedb.org/3/movie/${peliculaId}?api_key=${API_KEY}&language=es-ES`);
    const detalle = await respDetalle.json();

    // Fetch videos (trailers)
    const respVideos = await fetch(`https://api.themoviedb.org/3/movie/${peliculaId}/videos?api_key=${API_KEY}&language=es-ES`);
    const videosData = await respVideos.json();

    // Buscar trailer oficial de YouTube
    const trailer = videosData.results.find(v => v.site === "YouTube" && v.type === "Trailer") || videosData.results.find(v => v.site === "YouTube");

    // Renderizar Trailer
    const trailerContainer = document.getElementById("trailer-container");
    if (trailer) {
      trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`;
    } else {
      trailerContainer.innerHTML = `<p style="color:var(--text2);text-align:center;padding:40px;">No hay trailer disponible para esta película.</p>`;
    }

    // Renderizar Info
    const infoContainer = document.getElementById("info-container");
    const generos = detalle.genres.map(g => g.name).join(", ");
    infoContainer.innerHTML = `
      <h1>${detalle.title}</h1>
      <div class="info-meta">
        <span>📅 ${detalle.release_date || "N/A"}</span>
        <span>🎬 ${generos}</span>
        <span>⭐ ${detalle.vote_average?.toFixed(1)} TMDB</span>
      </div>
      <p class="info-descripcion">${detalle.overview || "Sin descripción disponible."}</p>
    `;

  } catch (error) {
    console.error("Error al cargar detalle:", error);
  }
}

// ── SISTEMA DE ESTRELLAS UI ──────────────────────────────────
function iniciarEstrellasUI() {
  const estrellas = document.querySelectorAll("#estrellas-input span");
  
  estrellas.forEach(estrella => {
    estrella.addEventListener("click", () => {
      puntuacionSeleccionada = parseInt(estrella.getAttribute("data-val"));
      // Actualizar visual
      estrellas.forEach(e => {
        if (parseInt(e.getAttribute("data-val")) <= puntuacionSeleccionada) {
          e.classList.add("active");
          e.textContent = "★";
        } else {
          e.classList.remove("active");
          e.textContent = "☆";
        }
      });
      document.getElementById("estrellas-error").style.display = "none";
    });
  });
}

// ── ENVIAR CALIFICACIÓN ──────────────────────────────────────
async function enviarCalificacion() {
  if (puntuacionSeleccionada === 0) {
    document.getElementById("estrellas-error").style.display = "block";
    return;
  }

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    alert("Debes iniciar sesión para calificar.");
    return;
  }

  const comentario = document.getElementById("comentario-input").value.trim();

  const { error } = await supabaseClient.from("calificaciones").insert([{
    usuario_id: user.id,
    pelicula_id: peliculaId,
    id_tmdb: peliculaId,
    puntuacion: puntuacionSeleccionada,
    comentario: comentario
  }]);

  if (error) {
    if (error.code === "23505") {
      alert("Ya calificaste esta película. ¡Solo se permite una calificación por película!");
    } else {
      alert("Error al guardar: " + error.message);
    }
    return;
  }

  alert("¡Gracias por tu calificación!");
  
  // Limpiar formulario
  puntuacionSeleccionada = 0;
  document.querySelectorAll("#estrellas-input span").forEach(e => {
    e.classList.remove("active");
    e.textContent = "☆";
  });
  document.getElementById("comentario-input").value = "";

  // Recargar comentarios
  await cargarComentarios();
}

// ── CARGAR COMENTARIOS EXISTENTES ─────────────────────────────
async function cargarComentarios() {
  const lista = document.getElementById("lista-comentarios");
  lista.innerHTML = "<p class='sin-comentarios'>Cargando comentarios...</p>";

  const { data, error } = await supabaseClient
    .from("calificaciones")
    .select("puntuacion, comentario, usuario_id")
    .eq("id_tmdb", peliculaId);

  if (error || !data || data.length === 0) {
    lista.innerHTML = "<p class='sin-comentarios'>Aún no hay comentarios. ¡Sé el primero!</p>";
    return;
  }

  lista.innerHTML = "";

  // Obtener nombres de usuario (hacemos fetch individual o masivo, aquí masivo)
  const userIds = [...new Set(data.map(c => c.usuario_id))];
  const { data: perfiles } = await supabaseClient
    .from("perfiles")
    .select("id, nombre")
    .in("id", userIds);

  const mapaNombres = {};
  perfiles?.forEach(p => mapaNombres[p.id] = p.nombre);

  data.forEach(cal => {
    const estrellas = "★".repeat(cal.puntuacion) + "☆".repeat(5 - cal.puntuacion);
    const nombre = mapaNombres[cal.usuario_id] || "Anónimo";

    const div = document.createElement("div");
    div.classList.add("comentario-card");
    div.innerHTML = `
      <div class="comentario-header">
        <span class="comentario-usuario">👤 ${nombre}</span>
        <span class="comentario-estrellas">${estrellas}</span>
      </div>
      <p class="comentario-texto">${cal.comentario || "<i>Sin comentario</i>"}</p>
    `;
    lista.appendChild(div);
  });
}

// ── EXPORTAR ──────────────────────────────────────────────────
window.enviarCalificacion = enviarCalificacion;