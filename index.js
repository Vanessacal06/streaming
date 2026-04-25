// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN"
);

// 🔍 Verificar si el correo existe en la tabla perfiles
async function verificarCorreoExiste(email) {
  const { data, error } = await supabaseClient
    .from("perfiles")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error verificando correo:", error.message);
    return false;
  }

  return data !== null;
}

// Registro de usuario
async function registrar() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nombre = document.getElementById("nombre").value;
  const edad = document.getElementById("edad").value;

  // 🔥 Validar si el correo ya existe
  const existe = await verificarCorreoExiste(email);

  if (existe) {
    alert("Este correo ya está registrado");
    return;
  }

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

    const nombre = user.user_metadata?.nombre || "";
    const edad = user.user_metadata?.edad || null;

    // Verificar si ya existe un perfil
    const { data: perfilExistente, error: perfilError } = await supabaseClient
      .from("perfiles")
      .select("*")
      .eq("identificacion", user.id)
      .single();

    if (perfilError && perfilError.code !== "PGRST116") {
      console.error("Error al consultar perfil:", perfilError.message);
    }

    if (!perfilExistente) {
      const { error: insertError } = await supabaseClient
        .from("perfiles")
        .insert([
          {
            identificacion: user.id,
            email: user.email, // 🔥 GUARDAR EMAIL (IMPORTANTE)
            nombre: nombre,
            edad: edad,
            tipo_suscripcion: "Pendiente",
            fecha_registro: new Date()
          }
        ]);

      if (insertError) {
        console.error("Error al crear perfil:", insertError.message);
        alert("Hubo un error al crear tu perfil: " + insertError.message);
        return;
      }
    }

    window.location.href = "planes.html";
  }
}

async function recuperarPassword() {
  const email = document.getElementById("emailRecuperar").value;

  if (!email) {
    alert("Por favor ingresa tu correo");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://vanessacal06.github.io/streaming/reset.html"
  });

  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Si el correo está registrado, recibirás un enlace de recuperación");
  }
}

// Exportar funciones
window.registrar = registrar;
window.login = login;
window.recuperarPassword = recuperarPassword;