// ======================================
// CONEXIÓN A SUPABASE
// ======================================

const supabaseClient =
  window.supabase.createClient(
    "https://wokruyihvhbkcgvlhsnk.supabase.co",
    "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN"
  );

// ======================================
// CATEGORÍAS TMDB
// ======================================

function mostrarCategoria(pelicula) {

  const categoriasTMDB = {

    28: "Acción",
    12: "Aventura",
    16: "Animación",
    35: "Comedia",
    80: "Crimen",
    99: "Documental",
    18: "Drama",
    10751: "Familiar",
    14: "Fantasía",
    36: "Historia",
    27: "Terror",
    10402: "Música",
    9648: "Misterio",
    10749: "Romance",
    878: "Ciencia ficción",
    53: "Suspenso"

  };

  if (
    !pelicula.genre_ids ||
    pelicula.genre_ids.length === 0
  ) {

    return "Sin categoría";
  }

  const resultado =
    pelicula.genre_ids
      .map(id => categoriasTMDB[id])
      .filter(Boolean);

  return resultado.length > 0
    ? resultado.join(", ")
    : "Sin categoría";
}

// ======================================
// CARGAR PELÍCULAS
// ======================================

async function cargarPeliculas() {

  try {

    // Validar API KEY
    if (
      typeof API_KEY === "undefined"
    ) {

      console.error(
        "API_KEY no existe"
      );

      alert(
        "Error: config.js no cargó correctamente."
      );

      return;
    }

    // Obtener contenedor
    const contenedor =
      document.getElementById(
        "peliculas"
      );

    if (!contenedor) {

      console.error(
        "No existe #peliculas"
      );

      return;
    }

    // Obtener usuario
    const {

      data: { user },

      error: userError

    } =
      await supabaseClient.auth.getUser();

    if (
      userError ||
      !user
    ) {

      alert(
        "Debes iniciar sesión primero."
      );

      return;
    }

    // Obtener perfil
    const {

      data: perfil,

      error: perfilError

    } =
      await supabaseClient
        .from("perfiles")
        .select(
          "tipo_suscripcion"
        )
        .eq(
          "identificacion",
          user.id
        )
        .single();

    if (
      perfilError ||
      !perfil
    ) {

      alert(
        "No se encontró el perfil."
      );

      return;
    }

    // TMDB
    const respuesta =
      await fetch(

        `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`

      );

    const datos =
      await respuesta.json();

    console.log(datos);

    if (
      datos.status_code
    ) {

      console.error(datos);

      alert(
        "Error con la API de TMDB."
      );

      return;
    }

    // Limpiar
    contenedor.innerHTML = "";

    // Recorrer películas
    for (const pelicula of datos.results) {

      // Plan básico
      if (
        perfil.tipo_suscripcion === "Básico"
      ) {

        if (
          pelicula.id % 2 === 0
        ) {

          continue;
        }

      }

      // Verificar existencia
      let {
        data: existente
      } =
        await supabaseClient
          .from("peliculas")
          .select("*")
          .eq(
            "identificacion_tmdb",
            pelicula.id
          )
          .single();

      // Insertar
      if (!existente) {

        await supabaseClient
          .from("peliculas")
          .insert([

            {

              titulo:
                pelicula.title,

              genero:
                mostrarCategoria(
                  pelicula
                ),

              anio:
                pelicula.release_date
                ?.split("-")[0],

              descripcion:
                pelicula.overview,

              identificacion_tmdb:
                pelicula.id

            }

          ]);

      }

      // Imagen
      const imagen =
        pelicula.poster_path

          ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`

          : "https://via.placeholder.com/500x750?text=Sin+Imagen";

      // Trailer
      const trailer =

        `https://www.youtube.com/results?search_query=${pelicula.title}+trailer`;

      // Tarjeta
      const div =
        document.createElement(
          "article"
        );

      div.classList.add(
        "pelicula"
      );

      div.innerHTML = `

        <img
          src="${imagen}"
          alt="${pelicula.title}"
        >

        <div class="pelicula-contenido">

          <h2>

            ${pelicula.title}

          </h2>

          <p class="categoria">

            🎬 ${mostrarCategoria(
              pelicula
            )}

          </p>

          <p class="descripcion">

            ${pelicula.overview}

          </p>

          <p class="estrellas">

            ⭐ ${pelicula.vote_average}

          </p>

          <a
            href="${trailer}"
            target="_blank"
            class="boton-trailer"
          >

            Ver Trailer

          </a>

          <button
            onclick="calificar(${pelicula.id})"
          >

            Calificar

          </button>

        </div>

      `;

      contenedor.appendChild(div);

    }

  }

  catch (error) {

    console.error(error);

  }

}

// ======================================
// CALIFICAR
// ======================================

async function calificar(
  idTmdb
) {

  const comentario =
    prompt(
      "Escribe tu comentario:"
    );

  const puntuacion =
    prompt(
      "Califica de 1 a 5:"
    );

  const {

    data: { user }

  } =
    await supabaseClient.auth.getUser();

  await supabaseClient
    .from("calificaciones")
    .insert([

      {

        identificacion_usuario:
          user.id,

        identificacion_tmdb:
          idTmdb,

        comentario:
          comentario,

        puntuacion:
          parseInt(
            puntuacion
          )

      }

    ]);

  alert(
    "¡Gracias por tu calificación!"
  );

}

// ======================================
// BUSCAR
// ======================================

async function buscarPeliculas() {

  const texto =
    document.getElementById(
      "buscador"
    ).value;

  if (
    texto.trim() === ""
  ) {

    cargarPeliculas();

    return;
  }

  const respuesta =
    await fetch(

      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${texto}`

    );

  const datos =
    await respuesta.json();

  const contenedor =
    document.getElementById(
      "peliculas"
    );

  contenedor.innerHTML = "";

  datos.results.forEach(
    pelicula => {

      const imagen =
        pelicula.poster_path

          ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`

          : "https://via.placeholder.com/500x750?text=Sin+Imagen";

      const trailer =

        `https://www.youtube.com/results?search_query=${pelicula.title}+trailer`;

      const div =
        document.createElement(
          "article"
        );

      div.classList.add(
        "pelicula"
      );

      div.innerHTML = `

        <img src="${imagen}">

        <div class="pelicula-contenido">

          <h2>

            ${pelicula.title}

          </h2>

          <p class="categoria">

            🎬 ${mostrarCategoria(
              pelicula
            )}

          </p>

          <p class="descripcion">

            ${pelicula.overview}

          </p>

          <p class="estrellas">

            ⭐ ${pelicula.vote_average}

          </p>

          <a
            href="${trailer}"
            target="_blank"
            class="boton-trailer"
          >

            Ver Trailer

          </a>

        </div>

      `;

      contenedor.appendChild(
        div
      );

    }
  );

}

// ======================================
// EXPORTAR
// ======================================

window.cargarPeliculas =
  cargarPeliculas;

window.buscarPeliculas =
  buscarPeliculas;

window.calificar =
  calificar;

// ======================================
// INICIAR
// ======================================

document.addEventListener(

  "DOMContentLoaded",

  cargarPeliculas

);