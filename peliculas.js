// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",   // Project URL correcto
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN" // tu anon key real
);

const API_KEY = "TU_API_KEY_TMDB";

// Cargar películas según el plan del usuario
async function cargarPeliculas() {
  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    alert("Debes iniciar sesión primero.");
    return;
  }

  // Consultar perfil del usuario
  const { data: perfil, error: perfilError } = await supabaseClient
    .from("perfiles")
    .select("tipo_suscripcion")
    .eq("identificación", user.id)
    .single();

  if (perfilError || !perfil) {
    alert("No se encontró el perfil del usuario.");
    return;
  }

  // Llamada a TMDB
  const respuesta = await fetch(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
  );
  const datos = await respuesta.json();

  const contenedor = document.getElementById("peliculas");
  contenedor.innerHTML = "";

  datos.results.forEach(async pelicula => {
    // Verificar si existe en Supabase
    let { data: existente } = await supabaseClient
      .from("peliculas")
      .select("*")
      .eq("identificacion_tmdb", pelicula.id)
      .single();

    if (!existente) {
      await supabaseClient.from("peliculas").insert([
        {
          titulo: pelicula.title,
          genero: pelicula.genre_ids.join(", "),
          anio: pelicula.release_date.split("-")[0],
          descripcion: pelicula.overview,
          identificacion_tmdb: pelicula.id
        }
      ]);
    }

    // Mostrar películas según plan
    if (perfil.tipo_suscripcion === "Básico") {
      // Ejemplo: solo mostrar las 5 primeras
      if (pelicula.id % 2 === 0) return; // filtro simple para limitar
    }

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${pelicula.title}</h3>
      <p>${pelicula.overview}</p>
      <button onclick="calificar(${pelicula.id})">Calificar</button>
    `;
    contenedor.appendChild(div);
  });
}

// Función para calificar una película
async function calificar(idTmdb) {
  const comentario = prompt("Escribe tu comentario:");
  const puntuacion = prompt("Califica de 1 a 5:");

  const { data: { user } } = await supabaseClient.auth.getUser();

  await supabaseClient.from("calificaciones").insert([
    {
      identificacion_usuario: user.id,
      identificacion_tmdb: idTmdb,
      comentario: comentario,
      puntuacion: parseInt(puntuacion)
    }
  ]);

  alert("¡Gracias por tu calificación!");
}

// Exportar funciones al ámbito global
window.cargarPeliculas = cargarPeliculas;
window.calificar = calificar;

// Ejecutar carga inicial
cargarPeliculas();