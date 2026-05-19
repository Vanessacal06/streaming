// peliculas.js - VELORA Catálogo

let generoActivo = "Todos";
const tmdbIdsRenderizados = [];

// ── MAPA GÉNEROS TMDB ─────────────────────────────────────────
const GENEROS = {
  28:"Acción", 12:"Aventura", 16:"Animación", 35:"Comedia",
  80:"Crimen", 99:"Documental", 18:"Drama", 10751:"Familiar",
  14:"Fantasía", 36:"Historia", 27:"Terror", 10402:"Música",
  9648:"Misterio", 10749:"Romance", 878:"Ciencia ficción", 53:"Suspenso"
};

function mostrarCategoria(pelicula) {
  if (!pelicula.genre_ids?.length) return "Sin categoría";
  const r = pelicula.genre_ids.map(id => GENEROS[id]).filter(Boolean);
  return r.length ? r.join(", ") : "Sin categoría";
}

// ── SINCRONIZAR DATOS CON SUPABASE ────────────────────────────
async function sincronizarConSupabase(peliculasTMDB) {
  if (!peliculasTMDB || peliculasTMDB.length === 0) return;

  try {
    const categoriasUpsert = Object.entries(GENEROS).map(([id, nombre]) => ({
      id_tmdb: parseInt(id),
      nombre: nombre
    }));
    const { error: errCat } = await supabaseClient.from("categorias").upsert(categoriasUpsert, { onConflict: 'id_tmdb' });
    if (errCat) console.error("Error guardando categorías:", errCat.message);

    const peliculasUpsert = peliculasTMDB.map(p => ({
      id_tmdb: p.id,
      titulo: p.title,
      descripcion: p.overview,
      poster_path: p.poster_path,
      fecha_lanzamiento: p.release_date || null
    }));
    const { error: errPeli } = await supabaseClient.from("peliculas").upsert(peliculasUpsert, { onConflict: 'id_tmdb' });
    if (errPeli) console.error("Error guardando películas:", errPeli.message);

    const relacionesUpsert = [];
    peliculasTMDB.forEach(p => {
      if (p.genre_ids) {
        p.genre_ids.forEach(catId => {
          relacionesUpsert.push({ pelicula_id_tmdb: p.id, categoria_id_tmdb: catId });
        });
      }
    });
    
    if (relacionesUpsert.length > 0) {
      const { error: errRel } = await supabaseClient.from("pelicula_categorias").upsert(relacionesUpsert, { onConflict: ['pelicula_id_tmdb', 'categoria_id_tmdb'] });
      if (errRel) console.error("Error guardando relaciones:", errRel.message);
    }
  } catch (err) {
    console.error("Error general sincronizando:", err);
  }
}

// ── SLIDER DE ESTRENOS ────────────────────────────────────────
function cargarSlider(peliculas) {
  const slider = document.getElementById("slider-estrenos");
  if (!slider) return;
  slider.innerHTML = "";
  peliculas.slice(0, 8).forEach(p => {
    const slide = document.createElement("article");
    slide.className = "slide-item";
    slide.style.backgroundImage = p.backdrop_path
      ? `url('https://image.tmdb.org/t/p/w1280${p.backdrop_path}')`
      : "none";
    slide.innerHTML = `
      <section class="slide-content">
        <h3 style="margin:0;font-size:15px;">${p.title}</h3>
        <span style="color:#00F0FF;font-size:12px;">⭐ ${p.vote_average?.toFixed(1)}</span>
      </section>
    `;
    slider.appendChild(slide);
  });
}

// ── CREAR TARJETA PELÍCULA ────────────────────────────────────
function crearCard(pelicula) {
  const txt = window.t?.() || {};
  const imagen = pelicula.poster_path
    ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
    : "https://via.placeholder.com/500x750?text=Sin+Imagen";

  const article = document.createElement("article");
  article.classList.add("pelicula");
  article.id = `pelicula-${pelicula.id}`;

  article.innerHTML = `
    <img src="${imagen}" alt="${pelicula.title}" loading="lazy">
    <section class="pelicula-contenido">
      <h2>${pelicula.title}</h2>
      <p class="categoria">🎬 ${mostrarCategoria(pelicula)}</p>
      <p class="descripcion">${pelicula.overview || "Sin descripción disponible."}</p>
      <span class="estrellas">⭐ ${pelicula.vote_average?.toFixed(1) || "N/A"} TMDB</span>
      <span class="estrellas" id="promedio-${pelicula.id}" style="font-size:13px;color:#00F0FF;"></span>
      <a href="detalle.html?id=${pelicula.id}" class="boton-trailer">
        ${txt.verTrailer || "Ver Detalle & Trailer"}
      </a>
      <a href="detalle.html?id=${pelicula.id}" class="boton-calificar">
        ${txt.calificar || "Calificar"} ⭐
      </a>
    </section>
  `;

  if (!tmdbIdsRenderizados.includes(pelicula.id)) {
    tmdbIdsRenderizados.push(pelicula.id);
  }

  return article;
}

// ── CARGAR PELÍCULAS ──────────────────────────────────────────
async function cargarPeliculas() {
  const contenedor = document.getElementById("peliculas");
  if (!contenedor) return;
  contenedor.innerHTML = "<p style='text-align:center;color:var(--text2);padding:40px'>Cargando...</p>";
  tmdbIdsRenderizados.length = 0;

  try {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      alert("Debes iniciar sesión.");
      window.location.href = "index.html";
      return;
    }

    const { data: perfil } = await supabaseClient
      .from("perfiles").select("tipo_suscripcion").eq("id", user.id).maybeSingle();

    const region = window.VELORA_REGION || localStorage.getItem("velora_region") || "CO";
    console.log("Cargando películas para región:", region);

    const resp = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1&region=${region}`
    );
    const datos = await resp.json();

    cargarSlider(datos.results);
    sincronizarConSupabase(datos.results);

    contenedor.innerHTML = "";
    for (const pelicula of datos.results) {
      if (generoActivo !== "Todos") {
        if (!mostrarCategoria(pelicula).includes(generoActivo)) continue;
      }
      if (perfil?.tipo_suscripcion?.toLowerCase().includes("básico") && pelicula.id % 2 === 0) continue;
      contenedor.appendChild(crearCard(pelicula));
    }

    if (window.cargarPromedios) {
      await cargarPromedios(tmdbIdsRenderizados);
    }

  } catch (err) {
    console.error("Error cargando películas:", err);
    contenedor.innerHTML = "<p style='text-align:center;color:#ff4444;padding:40px'>Error al cargar. Revisa tu conexión.</p>";
  }
}

// ── BUSCAR ────────────────────────────────────────────────────
async function buscarPeliculas() {
  const texto = document.getElementById("buscador").value.trim();
  if (!texto) { cargarPeliculas(); return; }

  const contenedor = document.getElementById("peliculas");
  contenedor.innerHTML = "";
  tmdbIdsRenderizados.length = 0;

  const region = window.VELORA_REGION || localStorage.getItem("velora_region") || "CO";

  const resp = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(texto)}&region=${region}`
  );
  const datos = await resp.json();

  sincronizarConSupabase(datos.results);

  datos.results.forEach(pelicula => {
    if (generoActivo !== "Todos" && !mostrarCategoria(pelicula).includes(generoActivo)) return;
    contenedor.appendChild(crearCard(pelicula));
  });

  if (window.cargarPromedios) await cargarPromedios(tmdbIdsRenderizados);
}

// ── FILTRAR POR GÉNERO ────────────────────────────────────────
function filtrarGeneroSelect() {
  generoActivo = document.getElementById("filtroGenero").value;
  cargarPeliculas();
}

// ── EXPORTAR ─────────────────────────────────────────────────
window.cargarPeliculas    = cargarPeliculas;
window.buscarPeliculas    = buscarPeliculas;
window.filtrarGeneroSelect = filtrarGeneroSelect;

document.addEventListener("DOMContentLoaded", cargarPeliculas);

// ← Recargar cuando cambie la región manualmente
window.addEventListener('regionCambiada', () => {
  console.log("Región cambiada — recargando películas...");
  cargarPeliculas();
});

// ← También cuando se detecte automáticamente
window.addEventListener('regionDetectada', () => {
  const selector = document.getElementById("selector-region");
  if (selector) selector.value = window.VELORA_REGION;
  cargarPeliculas();
});