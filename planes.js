async function cargarPlanes() {
  const { data: planes } = await supabaseClient
    .from("suscripciones")
    .select("*");

  const contenedor = document.getElementById("planes");
  contenedor.innerHTML = "";

  planes.forEach(plan => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${plan.nombre}</h3>
      <p>Precio: COP ${plan.precio}</p>
      <button onclick="seleccionarPlan(${plan.identificacion})">Elegir</button>
    `;
    contenedor.appendChild(div);
  });
}

async function seleccionarPlan(idPlan) {
  const { data: session } = await supabaseClient.auth.getSession();
  const user = session.session.user;

  await supabaseClient
    .from("perfiles")
    .update({ id_suscripcion: idPlan, tipo_suscripcion: "Activo" })
    .eq("identificacion", user.id);

  alert("Plan seleccionado correctamente.");
  window.location.href = "peliculas.html";
}

cargarPlanes();
