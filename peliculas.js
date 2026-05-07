// [Mantener tu conexión a Supabase y variables iniciales igual]
const supabaseClient = window.supabase.createClient(
    "https://wokruyihvhbkcgvlhsnk.supabase.co",
    "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN"
);

let generoActivo = "Todos";

// Lógica para el Slider de Estrenos
async function cargarSlider(peliculas) {
    const slider = document.getElementById("slider-estrenos");
    slider.innerHTML = "";
    
    // Tomamos las primeras 6 para el slider
    const estrenos = peliculas.slice(0, 6);
    
    estrenos.forEach(p => {
        const slide = document.createElement("article");
        slide.className = "slide-item";
        slide.style.backgroundImage = `url('https://image.tmdb.org/t/p/w1280${p.backdrop_path}')`;
        
        slide.innerHTML = `
            <section class="slide-content">
                <h3 style="margin:0; font-size:16px;">${p.title}</h3>
                <span style="color:#00F0FF; font-size:12px;">Estreno Recomendado</span>
            </section>
        `;
        slider.appendChild(slide);
    });
}

// [Tu función mostrarCategoria se queda igual]
function mostrarCategoria(pelicula) {
    const categoriasTMDB = {
        28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia", 80: "Crimen",
        99: "Documental", 18: "Drama", 10751: "Familiar", 14: "Fantasía",
        36: "Historia", 27: "Terror", 10402: "Música", 9648: "Misterio",
        10749: "Romance", 878: "Ciencia ficción", 53: "Suspenso"
    };
    if (!pelicula.genre_ids || pelicula.genre_ids.length === 0) return "Sin categoría";
    const resultado = pelicula.genre_ids.map(id => categoriasTMDB[id]).filter(Boolean);
    return resultado.length > 0 ? resultado.join(", ") : "Sin categoría";
}

// [Modificación leve en crearCard para el nuevo estilo]
function crearCard(pelicula) {
    const imagen = pelicula.poster_path ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}` : "https://via.placeholder.com/500x750?text=Sin+Imagen";
    const trailer = `https://www.youtube.com/results?search_query=${pelicula.title}+trailer`;
    const article = document.createElement("article");
    article.classList.add("pelicula");
    article.innerHTML = `
        <img src="${imagen}" alt="${pelicula.title}">
        <section class="pelicula-contenido">
            <h2>${pelicula.title}</h2>
            <p class="categoria">🎬 ${mostrarCategoria(pelicula)}</p>
            <p class="descripcion">${pelicula.overview}</p>
            <span class="estrellas">⭐ ${pelicula.vote_average}</span>
            <a href="${trailer}" target="_blank" class="boton-trailer">Ver Trailer</a>
            <button onclick="calificar(${pelicula.id})">Calificar</button>
        </section>
    `;
    return article;
}

// CARGAR PELÍCULAS (Incluye llamada al slider)
async function cargarPeliculas() {
    try {
        if (typeof API_KEY === "undefined") { alert("Error cargando API KEY"); return; }
        const contenedor = document.getElementById("peliculas");
        contenedor.innerHTML = "";

        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) { alert("Debes iniciar sesión."); return; }

        const { data: perfil } = await supabaseClient.from("perfiles").select("tipo_suscripcion").eq("identificacion", user.id).single();

        const respuesta = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`);
        const datos = await respuesta.json();

        // Llenar el slider con los datos obtenidos
        cargarSlider(datos.results);

        for (const pelicula of datos.results) {
            if (generoActivo !== "Todos") {
                const categorias = mostrarCategoria(pelicula);
                if (!categorias.includes(generoActivo)) continue;
            }
            if (perfil.tipo_suscripcion === "Básico" && pelicula.id % 2 === 0) continue;
            
            // Lógica de guardado en BD [Se mantiene igual]
            contenedor.appendChild(crearCard(pelicula));
        }
    } catch (error) { console.error(error); }
}

// [Funciones buscarPeliculas, calificar y filtrarGeneroSelect se mantienen igual]
async function buscarPeliculas() {
    const texto = document.getElementById("buscador").value;
    if (texto.trim() === "") { cargarPeliculas(); return; }
    const respuesta = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${texto}`);
    const datos = await respuesta.json();
    const contenedor = document.getElementById("peliculas");
    contenedor.innerHTML = "";
    datos.results.forEach(pelicula => {
        if (generoActivo !== "Todos") {
            const categorias = mostrarCategoria(pelicula);
            if (!categorias.includes(generoActivo)) return;
        }
        contenedor.appendChild(crearCard(pelicula));
    });
}

async function calificar(idTmdb) {
    const comentario = prompt("Escribe tu comentario:");
    const puntuacion = prompt("Califica de 1 a 5:");
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient.from("calificaciones").insert([{
        identificacion_usuario: user.id,
        identificacion_tmdb: idTmdb,
        comentario: comentario,
        puntuacion: parseInt(puntuacion)
    }]);
    alert("¡Gracias por tu calificación!");
}

function filtrarGeneroSelect() {
    const select = document.getElementById("filtroGenero");
    generoActivo = select.value;
    cargarPeliculas();
}



window.cargarPeliculas = cargarPeliculas;
window.buscarPeliculas = buscarPeliculas;
window.calificar = calificar;
window.filtrarGeneroSelect = filtrarGeneroSelect;

document.addEventListener("DOMContentLoaded", cargarPeliculas);