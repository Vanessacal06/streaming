// externalApi.js
// Tareas Jira: fetchClima() + cargarClima() + widget HTML

const OWM_KEY = "e34409d76ab0f379ab6826350ee5fb89"; 

// ── SEBASTIÁN: fetchClima(lat, lon) ──────────────────────────
// Recibe coordenadas, hace fetch a OpenWeatherMap,
// retorna { temperatura, descripcion, ciudad }
async function fetchClima(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_KEY}&units=metric&lang=es`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener clima");
    const data = await res.json();
    return {
      temperatura: Math.round(data.main.temp),
      descripcion: data.weather[0].description,
      ciudad: data.name,
      icono: data.weather[0].icon
    };
  } catch (err) {
    console.error("fetchClima error:", err);
    return null;
  }
}

// ── JHOAN: cargarClima() ─────────────────────────────────────
// Usa geolocalización, llama a fetchClima(), muestra en el widget
async function cargarClima() {
  const widget = document.getElementById("weather-widget");
  const iconEl = document.getElementById("weather-icon");
  const tempEl = document.getElementById("weather-temp");
  const cityEl = document.getElementById("weather-city");

  if (!widget) return; // El widget no está en esta página

  if (!navigator.geolocation) {
    if (cityEl) cityEl.textContent = "Geolocalización no disponible";
    return;
  }

  // Mostrar estado de carga
  if (tempEl) tempEl.textContent = "...";
  if (cityEl) cityEl.textContent = window.t?.()?.clima || "Cargando clima...";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const datos = await fetchClima(latitude, longitude);

      if (!datos) {
        if (cityEl) cityEl.textContent = "No se pudo obtener el clima";
        return;
      }

      // Mostrar icono
      if (iconEl) {
        iconEl.src = `https://openweathermap.org/img/wn/${datos.icono}.png`;
        iconEl.alt = datos.descripcion;
        iconEl.style.display = "inline";
      }
      if (tempEl) tempEl.textContent = `${datos.temperatura}°C`;
      if (cityEl) cityEl.textContent = datos.ciudad;
      if (widget) widget.title = datos.descripcion;
    },
    () => {
      // Usuario rechazó la geolocalización
      if (tempEl) tempEl.textContent = "";
      if (cityEl) cityEl.textContent =
        window.t?.()?.activaUbicacion || "Activa tu ubicación para ver el clima";
      if (iconEl) iconEl.style.display = "none";
    }
  );
}

// Exportar
window.fetchClima = fetchClima;
window.cargarClima = cargarClima;