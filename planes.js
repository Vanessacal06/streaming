// ======================================
// CONEXIÓN A SUPABASE
// ======================================

const supabaseClient = window.supabase.createClient(
  "https://wokruyihvhbkcgvlhsnk.supabase.co",
  "sb_publishable_-3hDnV-A6JPf8ySp4NC98w_CEodELwN"
);

// ======================================
// CARGAR PLANES
// ======================================

async function cargarPlanes() {

  const { data: planes, error } = await supabaseClient
    .from("suscripciones")
    .select("*");

  if (error) {

    console.error(
      "Error al cargar planes:",
      error.message
    );

    return;
  }

  const contenedor =
    document.getElementById("planes");

  contenedor.innerHTML = "";

  // ======================================
  // GENERAR TARJETAS
  // ======================================

  planes.forEach(plan => {

    const card =
      document.createElement("section");

    card.classList.add("plan-card");

    // Detectar premium
    const premium =
      plan.nombre.toLowerCase()
      .includes("premium");

    // Info personalizada
    let info = "";

    if (
      plan.nombre.toLowerCase()
      .includes("básico")
    ) {

      info =
        "1 pantalla • HD • Acceso limitado";
    }

    else if (
      plan.nombre.toLowerCase()
      .includes("estándar")
    ) {

      info =
        "2 pantallas • Full HD • Más contenido";
    }

    else if (
      plan.nombre.toLowerCase()
      .includes("premium")
    ) {

      info =
        "4 pantallas • Ultra HD 4K • Experiencia total";
    }

    else {

      info =
        "Streaming ilimitado • Calidad premium";
    }

    // ======================================
    // HTML DE LA TARJETA
    // ======================================

    card.innerHTML = `

      ${premium
        ? '<span class="badge">TOP</span>'
        : ''
      }

      <h3>
        ${plan.nombre}
      </h3>

      <!-- PRECIO -->
      <section class="price">

        <span class="currency">
          COP
        </span>

        <span class="number">
          ${plan.precio}
        </span>

        <span class="month">
          /mes
        </span>

      </section>

      <!-- BENEFICIOS -->
      <ul class="features">

        <li>Streaming HD y 4K</li>

        <li>Películas ilimitadas</li>

        <li>Series exclusivas</li>

        <li>Sin anuncios</li>

        <li>Acceso multidispositivo</li>

      </ul>

      <!-- INFO PLAN -->
      <p class="plan-info">

        ${info}

      </p>

      <!-- BOTÓN -->
      <button
        class="btn-plan"
        onclick="seleccionarPlan(
          ${plan.identificacion},
          '${plan.nombre}'
        )">

        🚀 ACTIVAR PLAN

      </button>

    `;

    contenedor.appendChild(card);

  });

}

// ======================================
// SELECCIONAR PLAN
// ======================================

async function seleccionarPlan(
  idPlan,
  nombrePlan
) {

  const {
    data: { user },
    error: userError
  } =
    await supabaseClient.auth.getUser();

  // Validar login
  if (userError || !user) {

    alert(
      "Debes iniciar sesión primero."
    );

    return;
  }

  // Actualizar perfil
  const { error } =
    await supabaseClient
      .from("perfiles")
      .update({

        id_suscripcion: idPlan,

        tipo_suscripcion: nombrePlan

      })
      .eq(
        "identificacion",
        user.id
      );

  // Error
  if (error) {

    alert(
      "Error al actualizar suscripción: "
      + error.message
    );

  }

  // Éxito
  else {

    alert(
      `Plan ${nombrePlan} activado correctamente ✅`
    );

    window.location.href =
      "peliculas.html";
  }

}

// ======================================
// EXPORTAR FUNCIONES
// ======================================

window.cargarPlanes = cargarPlanes;

window.seleccionarPlan =
  seleccionarPlan;

// ======================================
// CARGA INICIAL
// ======================================

cargarPlanes();

// ======================================
// FILTRO PELÍCULAS
// ======================================

function filtrar(categoria) {

  let peliculas =
    document.querySelectorAll('.pelicula');

  peliculas.forEach(peli => {

    if (categoria === 'todas') {

      peli.style.display = 'block';
    }

    else {

      peli.style.display =
        peli.classList.contains(categoria)
        ? 'block'
        : 'none';
    }

  });

}