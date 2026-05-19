// config.js - Configuración global de VELORA
const API_KEY = "e244f6162401026ec4697b963a245163";

// Supabase
const SUPABASE_URL = "https://ytdkmyotjzaissxfjjuu.supabase.co";
const SUPABASE_KEY = "sb_publishable_6_4LFbvOzGUfsnGyhgQvjQ_2JCVJxlH";

// Idiomas disponibles (Diccionario completo)
const IDIOMAS = {
  es: {
    // Index
    iniciarSesion: "Iniciar Sesión",
    registro: "Registro",
    correo: "Correo electrónico",
    contrasena: "Contraseña",
    nombre: "Nombre",
    edad: "Edad",
    ingresar: "INGRESAR",
    registrarse: "REGISTRARSE",
    recuperar: "Recuperar Contraseña",
    noTienes: "¿No tienes cuenta? Crear una",
    yaTienes: "¿Ya tienes cuenta? Iniciar sesión",
    olvidaste: "¿Olvidaste tu contraseña?",
    volver: "Volver al inicio",
    titulo_index: 'DESCUBRE HISTORIAS <br> <span class="highlight">SIN LÍMITES</span>',
    subtitulo: "Miles de películas y series para ver cuando quieras",
    f1: "🎬 Estrenos exclusivos",
    f2: "📺 Calidad HD",
    f3: "⭐ Para todos los gustos",
    link_registro: "Crear una cuenta nueva",
    link_recuperar: "¿Olvidaste tu contraseña?",
    link_login: "¿Ya tienes cuenta? Inicia sesión",
    recuperar_instruccion: "Enviaremos un enlace a tu correo",
    btn_recuperar: "RECUPERAR",
    
    // Global
    buscar: "Buscar películas o series...",
    todasCat: "Todas las categorías",
    footer: "© 2026 VELORA — Experiencia Futurista",
    perfil: "Mi Perfil",
    cerrarSesion: "Cerrar Sesión",
    temaClaro: "☀️ Claro",
    temaOscuro: "🌙 Oscuro",
    clima: "Cargando clima...",
    activaUbicacion: "Activa tu ubicación para ver el clima",
    
    // Películas
    calificar: "Calificar",
    verTrailer: "Ver Detalle & Trailer",
    
    // Planes
    elegirPlan: "ELIGE TU EXPERIENCIA",
    elegirPlan_sub: "Streaming ilimitado con calidad premium, historias épicas y una experiencia futurista.",
    planes_disponibles: "PLANES DISPONIBLES",
    activarPlan: "🚀 ACTIVAR PLAN",
    carrito_titulo: "🛒 Carrito de compra",
    suscripcion_mensual: "Suscripción mensual",
    pago_simulado: "DATOS DE PAGO (simulado)",
    pago_nombre_ph: "Nombre en la tarjeta",
    pago_numero_ph: "1234 5678 9012 3456",
    pago_exp_ph: "MM/AA",
    pago_cvv_ph: "CVV",
    pagar_ahora: "💳 PAGAR AHORA",
    
    // Detalle
    califica_comenta: "Califica y Comenta",
    comentario_ph: "Escribe tu comentario aquí... (opcional)",
    enviar_calif: "ENVIAR CALIFICACIÓN",
    opiniones: "Opiniones de los usuarios",
    
    // Perfil y pagos
    planActivo: "Plan activo",
    sinPlan: "Sin plan activo",
    datosPersonales: "Datos Personales",
    tarjetaGuardada: "Tarjeta guardada",
    sinTarjeta: "No hay tarjeta guardada",
    pagoExitoso: "¡Pago simulado exitoso! Plan activado ✅",
    camposRequeridos: "Por favor completa todos los campos",
    
    // Categorías
    accion: "Acción",
    drama: "Drama",
    comedia: "Comedia",
    terror: "Terror",
    romance: "Romance",
    ciencia_ficcion: "Ciencia ficción",
    animacion: "Animación",
    aventura: "Aventura"
  },
  en: {
    // Index
    iniciarSesion: "Sign In",
    registro: "Register",
    correo: "Email",
    contrasena: "Password",
    nombre: "Name",
    edad: "Age",
    ingresar: "SIGN IN",
    registrarse: "REGISTER",
    recuperar: "Recover Password",
    noTienes: "Don't have an account? Create one",
    yaTienes: "Already have an account? Sign in",
    olvidaste: "Forgot your password?",
    volver: "Back to login",
    titulo_index: 'DISCOVER STORIES <br> <span class="highlight">WITHOUT LIMITS</span>',
    subtitulo: "Thousands of movies and series to watch anytime",
    f1: "🎬 Exclusive releases",
    f2: "📺 HD Quality",
    f3: "⭐ For all tastes",
    link_registro: "Create a new account",
    link_recuperar: "Forgot your password?",
    link_login: "Already have an account? Log in",
    recuperar_instruccion: "We will send a link to your email",
    btn_recuperar: "RECOVER",
    
    // Global
    buscar: "Search movies or series...",
    todasCat: "All categories",
    footer: "© 2026 VELORA — Futuristic Experience",
    perfil: "My Profile",
    cerrarSesion: "Sign Out",
    temaClaro: "☀️ Light",
    temaOscuro: "🌙 Dark",
    clima: "Loading weather...",
    activaUbicacion: "Enable location to see weather",
    
    // Películas
    calificar: "Rate",
    verTrailer: "View Details & Trailer",
    
    // Planes
    elegirPlan: "CHOOSE YOUR EXPERIENCE",
    elegirPlan_sub: "Unlimited streaming with premium quality, epic stories and a futuristic experience.",
    planes_disponibles: "AVAILABLE PLANS",
    activarPlan: "🚀 ACTIVATE PLAN",
    carrito_titulo: "🛒 Shopping cart",
    suscripcion_mensual: "Monthly subscription",
    pago_simulado: "PAYMENT DATA (simulated)",
    pago_nombre_ph: "Name on the card",
    pago_numero_ph: "1234 5678 9012 3456",
    pago_exp_ph: "MM/YY",
    pago_cvv_ph: "CVV",
    pagar_ahora: "💳 PAY NOW",
    
    // Detalle
    califica_comenta: "Rate and Comment",
    comentario_ph: "Write your comment here... (optional)",
    enviar_calif: "SUBMIT RATING",
    opiniones: "User reviews",
    
    // Perfil y pagos
    planActivo: "Active plan",
    sinPlan: "No active plan",
    datosPersonales: "Personal Info",
    tarjetaGuardada: "Saved card",
    sinTarjeta: "No card saved",
    pagoExitoso: "Simulated payment successful! Plan activated ✅",
    camposRequeridos: "Please fill all fields",
    
    // Categorías
    accion: "Action",
    drama: "Drama",
    comedia: "Comedy",
    terror: "Horror",
    romance: "Romance",
    ciencia_ficcion: "Sci-Fi",
    animacion: "Animation",
    aventura: "Adventure"
  }
};

// Idioma activo
window.VELORA_IDIOMA = localStorage.getItem("velora_idioma") || "es";
window.t = () => IDIOMAS[window.VELORA_IDIOMA];