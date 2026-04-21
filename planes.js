// Conexión a Supabase
const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",   // Project URL correcto
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN" // tu anon key real
);

// Cargar planes desde la tabla 'suscripciones'
async function cargarPlanes() {
  const { data: planes, error } = await supabaseClient
    .from("suscripciones")
    .select("*");

  if (error) {
    console.error("Error al cargar planes:", error.message);
    return;
  }

  const contenedor = document.getElementById("planes");
  contenedor.innerHTML = "";

  planes.forEach(plan => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${plan.nombre}</h3>
      <p>Precio: COP ${plan.precio}</p>
      <button onclick="seleccionarPlan(${plan.identificacion}, '${plan.nombre}')">Elegir</button>
    `;
    contenedor.appendChild(div);
  });
}

// Seleccionar un plan y actualizar perfil
async function seleccionarPlan(idPlan, nombrePlan) {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    alert("Debes iniciar sesión primero.");
    return;
  }

  const { error } = await supabaseClient
    .from("perfiles")
    .update({
      id_suscripcion: idPlan,
      tipo_suscripcion: nombrePlan
    })
    .eq("identificacion", user.id); // columna correcta en tu tabla

  if (error) {
    alert("Error al actualizar suscripción: " + error.message);
  } else {
    alert(`Plan ${nombrePlan} activado correctamente ✅`);
    window.location.href = "peliculas.html";
  }
}

// Exportar funciones al ámbito global
window.cargarPlanes = cargarPlanes;
window.seleccionarPlan = seleccionarPlan;

// Ejecutar carga inicial
cargarPlanes();

