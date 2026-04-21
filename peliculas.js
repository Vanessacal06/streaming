const API_KEY = "TU_API_KEY_TMDB";

async function cargarPeliculas() {
  const respuesta = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`);
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

    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${pelicula.title}</h3>
      <p>${pelicula.overview}</p>
      <button onclick="calificar(${pelicula.id})">Calificar</button>
    `;
    contenedor.appendChild(div);
  });
}

cargarPeliculas();
