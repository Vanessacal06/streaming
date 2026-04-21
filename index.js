// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",   // Project URL correcto
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN" // tu anon key real
);

// Registro de usuario
async function registrar() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nombre = document.getElementById("nombre").value;
  const edad = document.getElementById("edad").value;

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://vanessacal06.github.io/streaming/planes.html",
      data: {
        nombre: nombre,
        edad: edad
      }
    }
  });

  if (error) {
    alert("Error en registro: " + error.message);
  } else {
    alert("Registro exitoso, revisa tu correo para confirmar.");
  }
}

// Login de usuario
async function login() {
  const email = document.getElementById("emailLogin").value;
  const password = document.getElementById("passwordLogin").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Error en login: " + error.message);
  } else {
    const user = data.user;

    // Verificar si ya existe un perfil
    const { data: perfilExistente, error: perfilError } = await supabaseClient
      .from("perfiles")
      .select("*")
      .eq("identificación", user.id)
      .single();

    if (perfilError) {
      console.error("Error al consultar perfil:", perfilError.message);
    }

    if (!perfilExistente) {
      // Insertar perfil en la tabla 'perfiles' si no existe
      const nombre = document.getElementById("nombre").value;
      const edad = document.getElementById("edad").value;

      const { error: insertError } = await supabaseClient
        .from("perfiles")
        .insert([
          {
            identificación: user.id, // columna correcta de tu tabla
            nombre: nombre,
            edad: edad,
            tipo_suscripcion: "Pendiente", // valor inicial hasta que elija plan
            fecha_registro: new Date()
          }
        ]);

      if (insertError) {
        console.error("Error al crear perfil:", insertError.message);
      }
    }

    // Redirige al flujo de planes
    window.location.href = "planes.html";
  }
}

// Exportar funciones al ámbito global
window.registrar = registrar;
window.login = login;
