// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN"
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

    // ✅ FIX 1: Tomar nombre y edad desde los metadatos del usuario
    // (los guardaste en signUp con options.data)
    // ya NO los leas desde el formulario porque esos campos están vacíos al hacer login
    const nombre = user.user_metadata?.nombre || "";
    const edad = user.user_metadata?.edad || null;

    // Verificar si ya existe un perfil
    const { data: perfilExistente, error: perfilError } = await supabaseClient
      .from("perfiles")
      .select("*")
      .eq("identificacion", user.id)
      .single();

    // ✅ FIX 2: El error "PGRST116" significa "no encontró filas", eso es normal
    // Solo mostramos error en consola si es un error real (no el de "no existe perfil")
    if (perfilError && perfilError.code !== "PGRST116") {
      console.error("Error al consultar perfil:", perfilError.message);
    }

    if (!perfilExistente) {
      const { error: insertError } = await supabaseClient
        .from("perfiles")
        .insert([
          {
            identificacion: user.id,
            nombre: nombre,       // ✅ ahora viene de user_metadata
            edad: edad,           // ✅ ahora viene de user_metadata
            tipo_suscripcion: "Pendiente",
            fecha_registro: new Date()
          }
        ]);

      if (insertError) {
        console.error("Error al crear perfil:", insertError.message);
        alert("Hubo un error al crear tu perfil: " + insertError.message);
        return; // ✅ FIX 3: Detener si falló el insert, no redirigir
      }
    }

    window.location.href = "planes.html";
  }
}

window.registrar = registrar;
window.login = login;