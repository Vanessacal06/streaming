async function calificar(id_tmdb) {
  const estrellas = prompt("¿Cuántas estrellas le das? (1-5)");
  const comentario = prompt("¿La recomiendas? Escribe tu opinión:");

  const { data: session } = await supabaseClient.auth.getSession();
  const user = session.session.user;

  // Buscar película en tu base
  const { data: pelicula } = await supabaseClient
    .from("peliculas")
    .select("identificacion")
    .eq("identificacion_tmdb", id_tmdb)
    .single();

  await supabaseClient.from("calificaciones").insert([
    {
      id_usuario: user.id,
      id_pelicula: pelicula.identificacion,
      puntuacion: parseInt(estrellas),
      comentario: comentario
    }
  ]);

  alert("¡Gracias por tu calificación!");
}
