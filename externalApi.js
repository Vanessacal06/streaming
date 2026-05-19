// externalApi.js
// Tareas Jira: fetchClima() + cargarClima() + widget HTML

const OWM_KEY = "e34409d76ab0f379ab6826350ee5fb89"; 

// ── SEBASTIÁN: fetchClima(lat, lon) ──────────────────────────
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
      icono: data.weather[0].icon,
      pais_codigo: data.sys.country
    };
  } catch (err) {
    console.error("fetchClima error:", err);
    return null;
  }
}

// ── JHOAN: cargarClima() ─────────────────────────────────────
async function cargarClima() {
  const widget = document.getElementById("weather-widget");
  const iconEl = document.getElementById("weather-icon");
  const tempEl = document.getElementById("weather-temp");
  const cityEl = document.getElementById("weather-city");

  if (!widget && !document.getElementById("region-indicator")) return;

  if (!navigator.geolocation) {
    if (cityEl) cityEl.textContent = "Geolocalización no disponible";
    return;
  }

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

      // Guardar región globalmente
      window.VELORA_REGION = datos.pais_codigo || "CO";
      localStorage.setItem("velora_region", window.VELORA_REGION);

      // Mostrar datos en el widget del clima
      if (iconEl) {
        iconEl.src = `https://openweathermap.org/img/wn/${datos.icono}.png`;
        iconEl.alt = datos.descripcion;
        iconEl.style.display = "inline";
      }
      if (tempEl) tempEl.textContent = `${datos.temperatura}°C`;
      if (cityEl) cityEl.textContent = `${datos.ciudad}, ${datos.pais_codigo}`;
      if (widget) widget.title = datos.descripcion;

      // Actualizar indicador visual
      if (typeof actualizarIndicadorUbicacion === 'function') actualizarIndicadorUbicacion();

      // ← CLAVE: Disparar evento para que otras páginas reaccionen
      window.dispatchEvent(new CustomEvent('regionDetectada', { detail: { region: window.VELORA_REGION } }));
    },
    () => {
      if (tempEl) tempEl.textContent = "";
      if (cityEl) cityEl.textContent = window.t?.()?.activaUbicacion || "Activa tu ubicación";
      if (iconEl) iconEl.style.display = "none";
      
      window.VELORA_REGION = localStorage.getItem("velora_region") || "CO";
      // Disparar evento incluso si falló (para usar valor por defecto)
      window.VELORA_REGION = localStorage.getItem("velora_region") || "CO";
      window.dispatchEvent(new CustomEvent('regionDetectada', { detail: { region: window.VELORA_REGION } }));
    }
  );
}

window.fetchClima = fetchClima;
window.cargarClima = cargarClima;