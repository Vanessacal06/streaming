// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "TU_SUPABASE_URL",       // Reemplaza con tu URL real
  "TU_SUPABASE_ANON_KEY"   // Reemplaza con tu anon key real
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
      emailRedirectTo: "hhttps://vanessacal06.github.io/streaming/",
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
    // Redirige al flujo de planes
    window.location.href = "planes.html";
  }
}



