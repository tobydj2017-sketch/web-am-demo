const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const animatedCards = document.querySelectorAll(".reveal-card");
const tiltCards = document.querySelectorAll(".method-card, .video-card, .service-card, .solution-list article, .custody-card, .company-photo, .values div, .contact-panel, .contact-form, .quick-contact a");
const chatbot = document.querySelector("[data-chatbot]");
const chatToggle = document.querySelector("[data-chat-toggle]");
const chatClose = document.querySelector("[data-chat-close]");
const chatForm = document.querySelector("[data-chat-form]");
const chatMessages = document.querySelector("[data-chat-messages]");
const chatSuggestions = document.querySelectorAll("[data-chat-suggestion]");
const chatStarts = document.querySelectorAll("[data-chat-start]");
const chatNudge = document.querySelector("[data-chat-nudge]");
const chatAudioToggle = document.querySelector("[data-chat-audio]");
const custodyVideo = document.querySelector("[data-custody-video]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const cursorAura = document.querySelector("[data-cursor-aura]");
const kineticSections = document.querySelectorAll(".hero, .quick-contact, .section, .site-footer");
const navLinks = document.querySelectorAll(".desktop-nav a[href^='#'], .mobile-nav a[href^='#']");
const navSections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const actionTargets = document.querySelectorAll(
  "button, .header-cta, .primary-button, .secondary-button, .quick-contact a, .desktop-nav a, .mobile-nav a, .site-footer a"
);
const selectionTransition = document.createElement("div");
selectionTransition.className = "selection-transition";
document.body.appendChild(selectionTransition);

const nudgeMessages = [
  "Realizá tu consulta",
  "Estoy aquí para sacar tus dudas",
  "Te ayudo a elegir tu plan",
  "Consultame por alarmas o cámaras",
  "¿Querés cotizar tu seguridad?",
  "BOT AM puede orientarte"
];

let audioContext = null;
let nudgeIndex = 0;
let nudgeTimer = null;
let custodyVideoIndex = 0;
let popupAudioEnabled = true;
let cursorFrame = null;
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;

try {
  popupAudioEnabled = localStorage.getItem("botAmPopupAudio") !== "off";
} catch (error) {
  popupAudioEnabled = true;
}

const syncPopupAudioButton = () => {
  if (!chatAudioToggle) return;
  chatAudioToggle.setAttribute("aria-pressed", String(!popupAudioEnabled));
  chatAudioToggle.setAttribute("aria-label", popupAudioEnabled ? "Apagar sonido del pop-up" : "Activar sonido del pop-up");
  chatAudioToggle.innerHTML = popupAudioEnabled
    ? '<i data-lucide="volume-2" aria-hidden="true"></i>'
    : '<i data-lucide="volume-x" aria-hidden="true"></i>';
  lucide.createIcons();
};

const playPopupSound = () => {
  if (!popupAudioEnabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(620, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.08);
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
  } catch (error) {
    // Audio is optional; browser policies can block it until the first interaction.
  }
};

const pulseSelection = (event) => {
  selectionTransition.style.setProperty("--select-x", `${event.clientX || window.innerWidth / 2}px`);
  selectionTransition.style.setProperty("--select-y", `${event.clientY || window.innerHeight / 2}px`);
  selectionTransition.classList.remove("is-active");
  void selectionTransition.offsetWidth;
  selectionTransition.classList.add("is-active");
};

const updateScrollProgress = () => {
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
  if (scrollProgress) scrollProgress.style.setProperty("--page-progress", String(progress));
  document.documentElement.style.setProperty("--scroll-progress", String(progress));
  document.documentElement.style.setProperty("--parallax-y", `${Math.min(110, window.scrollY * 0.1)}px`);
};

const moveCursorAura = () => {
  cursorFrame = null;
  if (!cursorAura) return;
  cursorAura.style.setProperty("--cursor-x", `${cursorX}px`);
  cursorAura.style.setProperty("--cursor-y", `${cursorY}px`);
  document.documentElement.style.setProperty("--cursor-x", `${cursorX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${cursorY}px`);
};

document.addEventListener("pointermove", (event) => {
  cursorX = event.clientX;
  cursorY = event.clientY;
  if (!cursorFrame) cursorFrame = window.requestAnimationFrame(moveCursorAura);
}, { passive: true });

const addButtonRipple = (target, event) => {
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "button-ripple";
  ripple.style.setProperty("--ripple-x", `${event.clientX - rect.left}px`);
  ripple.style.setProperty("--ripple-y", `${event.clientY - rect.top}px`);
  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
};

const moveAction = (target, event) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (target.classList.contains("chatbot-bubble")) return;

  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));
  const dx = (clampedX - 50) / 8;
  const dy = (clampedY - 50) / 10;
  const rotateY = (clampedX - 50) / 8;
  const rotateX = -(clampedY - 50) / 10;

  target.style.setProperty("--btn-x", `${clampedX}%`);
  target.style.setProperty("--btn-y", `${clampedY}%`);
  target.style.setProperty("--btn-dx", `${dx}px`);
  target.style.setProperty("--btn-dy", `${dy}px`);
  target.style.setProperty("--btn-rx", `${rotateX}deg`);
  target.style.setProperty("--btn-ry", `${rotateY}deg`);
};

const resetAction = (target) => {
  target.classList.remove("is-pressing");
  target.style.removeProperty("--btn-dx");
  target.style.removeProperty("--btn-dy");
  target.style.removeProperty("--btn-rx");
  target.style.removeProperty("--btn-ry");
  target.style.setProperty("--btn-x", "50%");
  target.style.setProperty("--btn-y", "50%");
};

actionTargets.forEach((target) => {
  target.classList.add("magnetic-action");

  target.addEventListener("mousemove", (event) => moveAction(target, event));
  target.addEventListener("mouseleave", () => resetAction(target));
  target.addEventListener("mousedown", () => target.classList.add("is-pressing"));
  target.addEventListener("mouseup", () => target.classList.remove("is-pressing"));
  target.addEventListener("click", (event) => {
    addButtonRipple(target, event);
    pulseSelection(event);
  });
});

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
  updateScrollProgress();
};

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.innerHTML = isOpen
    ? '<i data-lucide="x" aria-hidden="true"></i>'
    : '<i data-lucide="menu" aria-hidden="true"></i>';
  lucide.createIcons();
});

mobileNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    mobileNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
    lucide.createIcons();
  }
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
lucide.createIcons();

const canRevealOnScroll = "IntersectionObserver" in window;
const revealObserver = canRevealOnScroll
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    )
  : null;

animatedCards.forEach((card, index) => {
  card.style.setProperty("--reveal-delay", `${(index % 6) * 70}ms`);
  if (revealObserver) {
    revealObserver.observe(card);
  } else {
    card.classList.add("is-visible");
  }
});

const sectionObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.22 }
    )
  : null;

kineticSections.forEach((section) => {
  if (sectionObserver) {
    sectionObserver.observe(section);
  } else {
    section.classList.add("is-in-view");
  }
});

const navObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          .slice(0, 1)
          .forEach((entry) => setActiveNav(entry.target.id || "inicio"));
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: [0.2, 0.45, 0.7] }
    )
  : null;

navSections.forEach((section) => {
  if (navObserver) navObserver.observe(section);
});

let activeTiltCard = null;
let tiltFrame = null;

const resetTiltCard = (card) => {
  if (!card) return;
  card.classList.remove("is-tilting");
  card.style.transform = "";
  card.style.removeProperty("--rx");
  card.style.removeProperty("--ry");
  card.style.removeProperty("--sx");
  card.style.removeProperty("--sy");
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "0%");
};

const applyTilt = (card, event) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));
  const rotateY = (clampedX - 50) / 1.9;
  const rotateX = -(clampedY - 50) / 2.15;
  const shadowX = (clampedX - 50) / 1.7;
  const shadowY = Math.max(18, 46 - clampedY / 2.8);
  const lift = card.classList.contains("service-card") || card.classList.contains("video-card") ? 1.065 : card.classList.contains("company-photo") || card.classList.contains("contact-form") || card.classList.contains("contact-panel") ? 1.025 : 1.045;

  card.classList.add("is-tilting");
  card.style.setProperty("--mx", `${clampedX}%`);
  card.style.setProperty("--my", `${clampedY}%`);
  card.style.setProperty("--rx", `${rotateX}deg`);
  card.style.setProperty("--ry", `${rotateY}deg`);
  card.style.setProperty("--sx", `${shadowX}px`);
  card.style.setProperty("--sy", `${shadowY}px`);
  const isSoftPanel = card.classList.contains("company-photo") || card.classList.contains("contact-form") || card.classList.contains("contact-panel") || card.closest(".quick-contact");
  const depth = isSoftPanel ? 58 : 110;
  const rise = isSoftPanel ? -10 : -22;
  card.style.transform = `translate3d(0, ${rise}px, ${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${lift})`;
};

document.addEventListener("mousemove", (event) => {
  const card = event.target.closest(".method-card, .video-card, .service-card, .solution-list article, .custody-card, .company-photo, .values div, .contact-panel, .contact-form, .quick-contact a");
  if (!card) {
    resetTiltCard(activeTiltCard);
    activeTiltCard = null;
    return;
  }

  if (activeTiltCard && activeTiltCard !== card) {
    resetTiltCard(activeTiltCard);
  }

  activeTiltCard = card;
  if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
  tiltFrame = window.requestAnimationFrame(() => applyTilt(card, event));
});

document.addEventListener("mouseleave", () => {
  resetTiltCard(activeTiltCard);
  activeTiltCard = null;
});

tiltCards.forEach((card) => {
  card.addEventListener("mouseleave", () => {
    resetTiltCard(card);
    if (activeTiltCard === card) activeTiltCard = null;
  });
});

const rotateCustodyVideo = () => {
  if (!custodyVideo) return;
  const videos = (custodyVideo.dataset.videoList || "")
    .split(",")
    .map((video) => video.trim())
    .filter(Boolean);

  if (videos.length < 2) return;

  custodyVideoIndex = (custodyVideoIndex + 1) % videos.length;
  const nextVideo = videos[custodyVideoIndex];
  if (custodyVideo.currentSrc.endsWith(nextVideo)) return;

  custodyVideo.classList.add("is-switching");
  window.setTimeout(() => {
    custodyVideo.src = nextVideo;
    custodyVideo.load();
    custodyVideo.play().catch(() => {});
    window.setTimeout(() => custodyVideo.classList.remove("is-switching"), 420);
  }, 220);
};

if (custodyVideo) {
  custodyVideo.addEventListener("ended", rotateCustodyVideo);
  window.setInterval(rotateCustodyVideo, 9500);
}

const quoteState = {
  active: false,
  step: 0,
  answers: {}
};

const advisorState = {
  active: false,
  mode: "security",
  step: 0,
  answers: {}
};

const advisorFlows = {
  security: [
    {
      key: "objetivo",
      prompt: "Perfecto. Para asesorarte bien: qué querés proteger? Puede ser casa, comercio, empresa, deposito, edificio, flota o mercaderia."
    },
    {
      key: "riesgo",
      prompt: "Cuál es la preocupación principal? Robo, control de accesos, monitoreo, cámaras, personal, custodia, pérdida interna, rondines o seguimiento."
    },
    {
      key: "zona",
      prompt: "En que zona o localidad seria el servicio? Con eso se piensa cobertura, respuesta y tipo de operativo."
    },
    {
      key: "urgencia",
      prompt: "Es preventivo o lo necesitas urgente por un hecho reciente?"
    },
    {
      key: "contacto",
      prompt: "Para pasarlo a un asesor de AM, dejame nombre y teléfono. Si preferís, escribi 'WhatsApp' y te preparo el mensaje."
    }
  ],
  app: [
    {
      key: "proceso",
      prompt: "Bien. La app tiene que estar vinculada a seguridad u operación AM. ¿Qué proceso querés digitalizar: monitoreo, rondines, tecnicos, clientes, reportes, accesos, flota o incidentes?"
    },
    {
      key: "usuarios",
      prompt: "¿Quiénes la usarían? Clientes, técnicos, operadores, supervisores, vigiladores, administración o todos?"
    },
    {
      key: "funciones",
      prompt: "¿Qué funciones debería tener? Por ejemplo: reportes, fotos, ubicación, alertas, estados, historial, panel web, permisos o exportación."
    },
    {
      key: "integracion",
      prompt: "Tiene que conectarse con cámaras, alarmas, GPS, WhatsApp, planillas, control de acceso o algún sistema actual?"
    },
    {
      key: "contacto",
      prompt: "Con eso ya puedo armar una base. Dejame nombre y teléfono para que AM lo releve como proyecto real."
    }
  ]
};

const quoteSteps = [
  {
    key: "tipo",
    prompt: "Primero: qué querés proteger? Escribi hogar, comercio, empresa o flota.",
    retry: "Para arrancar necesito saber qué querés proteger: hogar, comercio, empresa o flota. Si no estas seguro, escribi 'no se' y te ayudo a elegir."
  },
  {
    key: "tamano",
    prompt: "Perfecto. ¿Qué tamaño tiene aproximadamente? Por ejemplo: 3 ambientes, local chico, depósito grande, 5 vehículos.",
    retry: "Ese dato puede servir, pero todavía necesito el tamaño aproximado: ambientes, metros, cantidad de accesos, vehículos o si es chico/mediano/grande. Si no lo sabés, escribí 'no se'."
  },
  {
    key: "tecnologia",
    prompt: "¿Qué tecnología te interesa sumar? Alarmas, cámaras, sensores perimetrales, control de acceso o GPS.",
    retry: "Necesito saber que tecnologia te interesa: alarmas, cámaras, sensores, barreras perimetrales, control de acceso, GPS o monitoreo. Si no lo sabés, escribí 'no se' y te recomiendo una combinación."
  },
  {
    key: "monitoreo",
    prompt: "¿Necesitás monitoreo 24/7 y aviso ante eventos? Respondé sí, no o no estoy seguro.",
    retry: "Para seguir necesito confirmar si querés monitoreo 24/7: si, no o no estoy seguro."
  },
  {
    key: "contacto",
    prompt: "Último dato: dejame tu nombre y teléfono para que un asesor revise esta orientacion y la convierta en presupuesto real.",
    retry: "Para que un asesor pueda seguirlo, necesito nombre y teléfono. Si preferís no dejarlo ahora, escribi 'prefiero asesor' o toca Consultar."
  }
];

const basePlan = {
  hogar: 48000,
  comercio: 68000,
  empresa: 125000,
  flota: 96000
};

const BOT_AM_SYSTEM_PROMPT = `
Sos BOT AM, un asesor comercial experto de AM Seguridad en Argentina.
Tu objetivo es responder como una persona real: entender la intención, razonar, hacer preguntas útiles y llevar la conversación hacia seguridad, continuidad operativa, prevención, control o una cotización.
Especialidades: seguridad física, vigilancia, custodias, monitoreo, alarmas, CCTV, sensores, barreras perimetrales, control de accesos, seguimiento satelital, seguridad patrimonial, investigaciones, mantenimiento, instalaciones, desarrollo de aplicaciones a medida, sistemas internos, tableros de control y marco legal general.
Límite: no actúes como asistente general. Si preguntan algo fuera de seguridad, respondelo brevemente con criterio humano y reconducilo a seguridad, prevención, protección, continuidad operativa o tranquilidad.
Si piden una app, software o página sin relación con seguridad, aclara que BOT AM solo orienta sobre aplicaciones vinculadas a seguridad, monitoreo, control de accesos, operativos, reportes, clientes, técnicos, rondines, flotas o gestión de riesgos. Luego pregunta que proceso de seguridad quieren digitalizar.
No prometas resultados absolutos, no des asesoramiento legal definitivo y no inventes habilitaciones. Para temas legales, aclara que orientas de forma general y que debe validar un asesor o autoridad competente.
Cuando detectes interes comercial, pedí datos mínimos: tipo de lugar, zona, urgencia, tecnología deseada y contacto.
`.trim();

const CHAT_HISTORY_LIMIT = 10;
const AI_ENDPOINT = window.BOT_AM_AI_ENDPOINT || "/api/bot-am";
const shouldTryRealAi = () => true;

const chatHistory = [];

const offTopicAngles = [
  {
    keywords: ["futbol", "boca", "river", "messi", "partido", "mundial", "deporte"],
    bridge: "El deporte cambia en segundos: estrategia, lectura del riesgo y reacción rápida. En seguridad pasa algo parecido: no alcanza con mirar, hay que anticiparse."
  },
  {
    keywords: ["clima", "lluvia", "tormenta", "calor", "frio", "granizo"],
    bridge: "El clima parece ajeno, pero afecta mucho a la seguridad: cámaras exteriores, sensores, barreras, energía de respaldo y rondines tienen que soportar esas condiciones."
  },
  {
    keywords: ["precio dolar", "dolar", "inflacion", "economia", "plata", "inversion", "comprar"],
    bridge: "Cuando los costos se mueven, proteger activos se vuelve más importante: camaras, alarmas y monitoreo ayudan a evitar pérdidas mayores que una cuota de servicio."
  },
  {
    keywords: ["viaje", "vacaciones", "hotel", "auto", "ruta", "aeropuerto"],
    bridge: "Cuando alguien viaja, la casa, el comercio o la flota quedan más expuestos. Ahí conviene alarma monitoreada, cámaras remotas y protocolo de aviso."
  },
  {
    keywords: ["comida", "restaurante", "cena", "almuerzo", "cafe"],
    bridge: "Hasta un local gastronómico necesita pensar seguridad: caja, depósito, accesos de proveedores, camaras y apertura/cierre son puntos sensibles."
  },
  {
    keywords: ["musica", "pelicula", "serie", "netflix", "juego", "gaming"],
    bridge: "Buena elección para charlar, pero lo llevo a lo importante: mientras disfrutamos, la seguridad debería trabajar en segundo plano con monitoreo y alertas."
  }
];

const knowledgeBase = [
  {
    title: "alarmas para hogar",
    keywords: ["alarma", "alarmas", "casa", "hogar", "familia", "departamento", "vivienda", "sensor", "sensores", "puerta", "ventana"],
    text: "Para hogar recomiendo combinar alarma monitoreada, sensores en accesos, sensores interiores según el ambiente, botón de pánico si hace falta y camaras con visualización remota. Lo importante es cubrir entradas, puntos ciegos y horarios donde la casa queda sola."
  },
  {
    title: "cámaras y CCTV",
    keywords: ["camara", "camaras", "cctv", "dvr", "nvr", "ip", "domo", "lente", "grabación", "ver", "celular", "remoto"],
    text: "En cámaras hay que definir cantidad de puntos, calidad de imagen, visión nocturna, tiempo de grabación y acceso desde celular. Para comercios conviene cubrir caja, ingreso, deposito y vereda; para hogares, entradas, cochera y perímetro."
  },
  {
    title: "comercios y locales",
    keywords: ["comercio", "local", "negocio", "kiosco", "oficina", "tienda", "shop", "caja", "deposito"],
    text: "Para comercios conviene un plan mixto: alarma monitoreada, camaras en caja e ingreso, control de accesos para zonas internas y protocolos de apertura/cierre. Si hay mercadería sensible, se puede sumar presencia fisica o rondines."
  },
  {
    title: "empresas e instituciones",
    keywords: ["empresa", "industria", "institucion", "consorcio", "edificio", "planta", "fabrica", "barrio", "country", "escuela"],
    text: "Para empresas e instituciones se arma una matriz de riesgo: accesos, horarios, personal, visitas, activos críticos y respuesta. Puede incluir vigilancia física, camaras, alarmas, control de accesos, monitoreo y reportes."
  },
  {
    title: "custodia y flotas",
    keywords: ["custodia", "mercaderia", "flota", "satelital", "gps", "transito", "camion", "vehiculo", "carga", "reparto", "ruta"],
    text: "Para flotas y mercadería se puede combinar seguimiento satelital, custodia en tránsito, control de desvíos, alertas por detención y protocolos ante emergencia. Para cotizar bien necesito origen, destino, frecuencia y tipo de carga."
  },
  {
    title: "aplicaciones a medida",
    keywords: ["aplicacion", "aplicaciones", "app", "software", "sistema", "sistemas", "panel", "tablero", "dashboard", "desarrollo", "programa", "web", "herramienta", "medida"],
    text: "AM también desarrolla aplicaciones y sistemas a medida: paneles internos, tableros de control, apps para operativos, seguimiento, reportes, clientes, técnicos o administración. La idea es adaptar la herramienta al proceso real del cliente, no obligar al cliente a adaptarse a un sistema genérico."
  },
  {
    title: "vigilancia física",
    keywords: ["guardia", "guardias", "vigilador", "vigilancia", "presencia", "puesto", "rondin", "rondines", "control"],
    text: "La vigilancia física sirve cuando necesitás presencia preventiva, control de ingreso, recorridas o respuesta inmediata. Se define por horarios, cantidad de puestos, funciones del vigilador y nivel de riesgo del objetivo."
  },
  {
    title: "monitoreo 24/7",
    keywords: ["monitoreo", "24/7", "24 horas", "central", "evento", "respuesta", "alerta", "emergencia", "panic", "panico"],
    text: "El monitoreo 24/7 permite recibir eventos de alarma o cámaras, verificar la situación y activar el protocolo acordado. Es clave dejar contactos, prioridades y pasos de respuesta definidos desde el inicio."
  },
  {
    title: "control de accesos",
    keywords: ["acceso", "accesos", "tarjeta", "biometrico", "huella", "qr", "molinetes", "porton", "entrada", "visitantes"],
    text: "El control de accesos ordena quien entra, cuando entra y a qué zona puede ingresar. Puede ser con tarjetas, llaveros, biometría, QR o registro de visitas según el tipo de lugar."
  },
  {
    title: "precio y cotización",
    keywords: ["precio", "sale", "cuanto", "cuanto cuesta", "costo", "presupuesto", "cotizar", "cotizacion", "calcula", "calcular", "abono"],
    text: "El precio depende de cantidad de sensores, camaras, accesos, monitoreo, horarios y si necesitás personal físico. Puedo hacerte una orientación ahora: escribí 'cotizar' y te hago preguntas cortas."
  },
  {
    title: "instalación y mantenimiento",
    keywords: ["instalar", "instalacion", "mantenimiento", "tecnico", "reparar", "configurar", "soporte", "service", "revision"],
    text: "La instalación se planifica relevando accesos, conectividad, energía, ubicación de equipos y cobertura. Después conviene mantenimiento para revisar cámaras, sensores, baterias, grabación y conectividad."
  },
  {
    title: "contacto",
    keywords: ["telefono", "contacto", "whatsapp", "mail", "email", "direccion", "ubicacion", "moron", "asesor"],
    text: "Podés contactar a AM al (011) 5671-4600, por mail a ventas@amseguridad.com.ar o acercarte a Av. Rivadavia 18499, Morón. También podés usar el botón Consultar para escribir por WhatsApp."
  },
  {
    title: "horarios y cobertura",
    keywords: ["horario", "horarios", "zona", "zonas", "cobertura", "atienden", "buenos aires", "gba", "interior"],
    text: "AM trabaja con soluciones adaptadas por zona y necesidad. Para confirmar cobertura exacta conviene indicar localidad, tipo de objetivo y urgencia; con eso un asesor puede validar disponibilidad."
  },
  {
    title: "robos y prevención",
    keywords: ["robo", "robaron", "inseguridad", "miedo", "entraron", "prevencion", "riesgo", "urgente", "emergencia"],
    text: "Si hubo un hecho reciente, primero prioriza seguridad personal y denuncia correspondiente. Para prevenir nuevos eventos, conviene relevar accesos vulnerables, iluminación, cámaras, alarma monitoreada y protocolo de respuesta."
  },
  {
    title: "diferencia entre servicios",
    keywords: ["diferencia", "mejor", "conviene", "comparar", "sirve", "necesito", "recomendas", "recomendacion"],
    text: "Si querés prevenir intrusiones, alarma y sensores. Si querés ver y registrar, camaras. Si querés respuesta continua, monitoreo. Si querés presencia en el lugar, vigilancia física. Si hay vehiculos o carga, GPS y custodia."
  },
  {
    title: "marco legal de seguridad privada",
    keywords: ["ley", "legal", "legales", "normativa", "habilitacion", "habilitada", "regulacion", "provincia", "pba", "caba", "seguridad privada"],
    text: "En Argentina la seguridad privada se regula por jurisdiccion. En Provincia de Buenos Aires es clave revisar la Ley 12.297 y su reglamentacion; en CABA, la Ley 1.913 regula vigilancias, serenos, custodias, seguridad de personas/bienes y vigilancia por medios electronicos. BOT AM puede orientar, pero una habilitacion, contrato o servicio armado debe validarse con la autoridad competente y asesor legal vigente."
  },
  {
    title: "videovigilancia y datos personales",
    keywords: ["datos personales", "privacidad", "videovigilancia", "cartel", "carteles", "grabar personas", "grabaciónes", "ley 25326", "aaip", "base de datos"],
    text: "La videovigilancia puede involucrar datos personales. En Argentina aplica la Ley 25.326: se recomienda informar la existencia de camaras, finalidad de captacion y datos de contacto del responsable. No hace falta publicar la ubicación exacta de cada cámara, pero sí informar que hay videovigilancia y para que se usa. Para casos sensibles conviene validar con asesor legal o la AAIP."
  },
  {
    title: "instalación CCTV profesional",
    keywords: ["instalar cctv", "instalacion cctv", "poe", "utp", "cat6", "balun", "ip66", "varifocal", "nvr", "dvr", "disco", "hdd", "rack", "switch"],
    text: "Una instalación CCTV profesional empieza con relevamiento: objetivos de cámara, distancia, ángulo, luz, altura, alimentación, red y grabación. En IP suele usarse UTP Cat5e/Cat6 con PoE, switch adecuado y NVR; en analógico HD puede usarse coaxial o UTP con balun y DVR. También se calcula almacenamiento por resolución, FPS, compresión, días de retención y cantidad de camaras."
  },
  {
    title: "ubicación de cámaras",
    keywords: ["donde poner camaras", "ubicacion camaras", "angulo camara", "altura camara", "punto ciego", "visión nocturna", "infrarrojo", "lpr", "patente"],
    text: "Las cámaras deben ubicarse según objetivo: identificar rostros, ver movimientos, controlar caja, registrar patente o cubrir perímetro. Para identificar, no alcanza con una vista panoramica: se necesita ángulo cerrado, buena luz y altura correcta. Hay que evitar contraluces, reflejos, puntos ciegos y encuadres que invadan espacios no necesarios."
  },
  {
    title: "sensores de alarma",
    keywords: ["pir", "magnetico", "sensor magnetico", "sensor movimiento", "doble tecnología", "barrera infrarroja", "sirena", "teclado", "panel alarma", "zona", "zonas"],
    text: "En alarmas se combinan sensores magnéticos para puertas/ventanas, PIR para movimiento interior, doble tecnología donde hay cambios de temperatura o mascotas, barreras infrarrojas para perímetros y sirenas internas/externas. El panel debe dividir zonas para saber dónde se produjo el evento y facilitar respuesta."
  },
  {
    title: "barreras perimetrales",
    keywords: ["barrera", "barreras", "perimetral", "cerco", "cerco electrico", "infrarroja exterior", "fotocelula", "perímetro"],
    text: "Las barreras perimetrales sirven para detectar antes de que entren. Se instalan cuidando alineación, altura, vegetación, mascotas, lluvia, sol directo y falsas alarmas. En exteriores conviene equipos aptos intemperie, buena fijación, protección del cableado y pruebas de corte por zonas."
  },
  {
    title: "control de accesos avanzado",
    keywords: ["control acceso", "control de acceso", "lector", "cerradura magnetica", "electroiman", "abrepuerta", "biometría", "tarjeta rfid", "mifare", "anti passback"],
    text: "Un control de accesos profesional define puertas, perfiles, horarios, método de autenticación y salida segura. Puede usar lector RFID, biometría, PIN, QR, electroimán, cerradura eléctrica, botón de salida y fuente con respaldo. En puertas críticas se revisa fail-safe/fail-secure, evacuación y registro de eventos."
  },
  {
    title: "monitoreo de alarmas y protocolo",
    keywords: ["protocolo", "llamado", "disparo", "falsa alarma", "evento alarma", "central monitoreo", "verificacion", "acuda"],
    text: "El monitoreo funciona mejor con protocolo claro: orden de llamados, palabra clave si aplica, responsables, horarios, zonas críticas y qué hacer ante robo, incendio, pánico o sabotaje. También se reducen falsas alarmas capacitando usuarios y revisando sensores mal ubicados."
  },
  {
    title: "custodia y uso de personal",
    keywords: ["custodio", "custodios", "custodia armada", "arma", "armado", "vigilador armado", "escolta", "mercaderia en transito"],
    text: "La custodia requiere evaluar riesgo, recorrido, horarios, tipo de carga/persona, comunicacion, puntos de detención y protocolo. Si hay uso de armas o personal armado, debe cumplir habilitaciones, autorizaciones, capacitación y normativa aplicable. No conviene improvisar custodias sin respaldo documental y operativo."
  },
  {
    title: "diseño de proyecto de seguridad",
    keywords: ["proyecto", "relevamiento", "matriz de riesgo", "analisis de riesgo", "plan seguridad", "diseñar seguridad", "auditoria"],
    text: "Un buen proyecto se arma en etapas: relevamiento, identificación de riesgos, activos a proteger, amenazas probables, vulnerabilidades, medidas físicas/electrónicas, protocolo, presupuesto, instalación, capacitación y mantenimiento. La tecnología sola no alcanza si no hay proceso y responsables."
  },
  {
    title: "mantenimiento técnico",
    keywords: ["bateria", "ups", "fuente", "backup", "mantenimiento camaras", "limpieza lente", "firmware", "conexion", "internet"],
    text: "El mantenimiento debe revisar lentes, enfoque, visión nocturna, estado de discos, fuentes, UPS, baterías de alarma, conectividad, firmware, usuarios, grabación real y pruebas de evento. Muchas fallas aparecen por energía, red, humedad, cableado o mala ubicacion."
  }
];

const addMessage = (text, type) => {
  const message = document.createElement("p");
  message.className = type === "user" ? "user-message" : "bot-message";
  message.textContent = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return message;
};

const rememberMessage = (role, content) => {
  chatHistory.push({ role, content });
  if (chatHistory.length > CHAT_HISTORY_LIMIT) {
    chatHistory.splice(0, chatHistory.length - CHAT_HISTORY_LIMIT);
  }
};

const showThinking = () => {
  const message = addMessage("BOT AM está analizando la consulta...", "bot");
  message.classList.add("is-thinking");
  return message;
};

const removeThinking = (message) => {
  if (message) message.remove();
};

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const detectPlanType = (text) => {
  const normalized = normalizeText(text);
  if (normalized.includes("flota") || normalized.includes("vehiculo") || normalized.includes("gps")) return "flota";
  if (normalized.includes("empresa") || normalized.includes("industria") || normalized.includes("deposito")) return "empresa";
  if (normalized.includes("comercio") || normalized.includes("local") || normalized.includes("negocio")) return "comercio";
  return "hogar";
};

const isUnknownAnswer = (normalized) =>
  /\b(no se|nose|no estoy seguro|no estoy segura|ni idea|desconozco|no sabria)\b/.test(normalized);

const looksLikeLocation = (normalized) =>
  /\b(zona|localidad|barrio|nordelta|moron|castelar|ituzaingo|merlo|ramos|haedo|caba|capital|gba|provincia|country|barrio cerrado)\b/.test(normalized);

const validateQuoteAnswer = (stepKey, text) => {
  const normalized = normalizeText(text);
  if (isUnknownAnswer(normalized)) return { valid: true, note: "No hay problema. Lo marco como dato a relevar por un asesor." };

  if (stepKey === "tipo") {
    const valid = /\b(casa|hogar|vivienda|departamento|comercio|local|negocio|empresa|industria|deposito|oficina|flota|vehiculo|auto|camion|carga)\b/.test(normalized);
    return { valid };
  }

  if (stepKey === "tamano") {
    if (looksLikeLocation(normalized)) {
      quoteState.answers.zona = text;
      return {
        valid: false,
        message: "Perfecto, tomo la zona como dato importante. Ahora necesito el tamano aproximado: ambientes, metros, cantidad de accesos, vehículos o si es chico/mediano/grande. Si no lo sabés, escribí 'no se'."
      };
    }
    const valid = /\d/.test(normalized) || /\b(chico|pequeno|pequena|mediano|mediana|grande|ambiente|ambientes|m2|metros|piso|pisos|acceso|accesos|vehiculo|vehiculos|auto|autos|camion|camiones|deposito|galpon)\b/.test(normalized);
    return { valid };
  }

  if (stepKey === "tecnologia") {
    const valid = /\b(alarma|alarmas|camara|camaras|cctv|sensor|sensores|barrera|barreras|perimetral|acceso|accesos|gps|satelital|monitoreo|guardia|custodia|todo|completo|integral)\b/.test(normalized);
    return { valid };
  }

  if (stepKey === "monitoreo") {
    const valid = /\b(si|sí|no|seguro|segura|monitoreo|24|evento|aviso)\b/.test(normalized);
    return { valid };
  }

  if (stepKey === "contacto") {
    const valid = /\d{6,}/.test(normalized) || /\b(whatsapp|asesor|consultar|prefiero|llamen|llamar|mail|email|@)\b/.test(normalized);
    return { valid };
  }

  return { valid: true };
};

const detectCommercialSignal = (normalized) => {
  if (/(cotiz|precio|cuanto|presupuesto|asesor|whatsapp|telefono|contact|comprar|contratar|necesito|quiero|urgente)/.test(normalized)) {
    return "lead";
  }
  if (/(robo|entraron|miedo|inseguridad|amenaza|riesgo|perdida|sabotaje|alarma|camara|cctv|sensor|guardia|custodia|monitoreo|acceso|barrera|gps)/.test(normalized)) {
    return "security";
  }
  return "conversation";
};

const findOffTopicBridge = (normalized) =>
  offTopicAngles.find((topic) => topic.keywords.some((keyword) => normalized.includes(normalizeText(keyword))));

const isAppIntent = (normalized) =>
  /\b(app|aplicacion|aplicaciones|software|sistema|sistemas|web|pagina|programa|dashboard|tablero|panel|herramienta)\b/.test(normalized);

const isSecurityContext = (normalized) =>
  /\b(seguridad|monitoreo|camara|camaras|cctv|alarma|alarmas|sensor|sensores|barrera|barreras|acceso|accesos|custodia|custodias|guardia|vigilancia|rondin|rondines|flota|gps|satelital|riesgo|operativo|operacion|reporte|tecnico|tecnicos|cliente|clientes|control|incidente|evento)\b/.test(normalized);

const buildAppSecurityReply = (normalized) => {
  if (isSecurityContext(normalized)) {
    return "Si hablamos de una app vinculada a seguridad, AM puede desarrollar sistemas a medida para monitoreo, reportes, control de rondines, gestion de tecnicos, paneles para clientes, seguimiento de flotas, incidentes, accesos o tableros operativos. Para orientarte bien necesito saber que proceso queres digitalizar: monitoreo, vigilancia, CCTV, flota, control de accesos, reportes o atencion al cliente.";
  }

  return "Puedo orientarte, pero como BOT AM me limito a seguridad. Si queres hacer una app, la puedo pensar cuando este relacionada con seguridad u operacion: monitoreo, alarmas, CCTV, rondines, tecnicos, clientes, accesos, reportes, flotas o gestion de riesgos. Decime que proceso de seguridad queres digitalizar y te propongo una estructura.";
};

const buildHumanFallback = (text, scoredMatches) => {
  const normalized = normalizeText(text);
  const signal = detectCommercialSignal(normalized);
  const planType = detectPlanType(normalized);
  const placeLabel = {
    hogar: "tu casa",
    comercio: "tu comercio",
    empresa: "tu empresa",
    flota: "tus vehiculos"
  }[planType];

  if (scoredMatches.length) {
    const best = scoredMatches[0].item;
    const extra =
      scoredMatches.length > 1
        ? ` Tambien se conecta con ${scoredMatches.slice(1, 3).map((match) => match.item.title).join(" y ")}.`
        : "";
    return `${best.text}${extra} Pensándolo como asesor, el siguiente paso sería relevar ${placeLabel}: accesos, horarios críticos, puntos ciegos y respuesta esperada. Si querés, te hago una cotización guiada ahora.`;
  }

  const bridge = findOffTopicBridge(normalized);
  if (bridge) {
    return `${bridge.bridge} Te lo bajo a algo concreto: si queres proteger ${placeLabel}, puedo hacerte 4 preguntas y decirte que combinación de alarma, cámaras, sensores, monitoreo o vigilancia conviene.`;
  }

  if (signal === "lead") {
    return `Lo razono comercialmente: antes de venderte algo, conviene entender qué riesgo querés bajar y qué tan rápido necesitás respuesta. Para ${placeLabel}, necesito saber zona, cantidad de accesos, horarios vulnerables y si queres camaras, alarma, monitoreo o personal físico. Escribí "cotizar" y lo armamos paso a paso.`;
  }

  return `Puedo ayudarte con eso y llevarlo a seguridad: la pregunta de fondo es qué querés proteger, de que riesgo y con que nivel de respuesta. AM puede resolverlo combinando prevención, detección y acción: vigilancia física, CCTV, alarmas, sensores, monitoreo, control de accesos o custodia. Decime si hablamos de hogar, comercio, empresa o flota y te recomiendo un plan.`;
};

const estimateQuote = () => {
  const type = detectPlanType(`${quoteState.answers.tipo || ""} ${quoteState.answers.tamano || ""}`);
  const sizeText = normalizeText(`${quoteState.answers.tamano || ""} ${quoteState.answers.tecnologia || ""}`);
  const hasMonitoring = normalizeText(quoteState.answers.monitoreo || "").includes("si");
  const numbers = sizeText.match(/\d+/g)?.map(Number) || [];
  const biggestNumber = numbers.length ? Math.max(...numbers) : 1;
  const sizeFactor = sizeText.includes("grande") || biggestNumber >= 5 ? 1.45 : sizeText.includes("chico") || biggestNumber <= 2 ? 1 : 1.22;
  const cameraFactor = sizeText.includes("camara") ? 1.18 : 1;
  const accessFactor = sizeText.includes("acceso") || sizeText.includes("perimetral") || sizeText.includes("gps") ? 1.16 : 1;
  const monitoringAdd = hasMonitoring ? 18000 : 0;
  const estimate = Math.round(((basePlan[type] || basePlan.hogar) * sizeFactor * cameraFactor * accessFactor + monitoringAdd) / 1000) * 1000;
  const monthly = Math.round((estimate * 0.18 + monitoringAdd) / 1000) * 1000;
  const planName = {
    hogar: "Plan Hogar Protegido",
    comercio: "Plan Comercio Activo",
    empresa: "Plan Empresa 360",
    flota: "Plan Flota Custodiada"
  }[type];

  return `Orientación AM: te recomendaría ${planName}. Instalacion/equipamiento desde $${estimate.toLocaleString("es-AR")} y abono operativo estimado desde $${monthly.toLocaleString("es-AR")} mensuales, sujeto a visita técnica. Ya tengo una base para que un asesor lo cierre con datos reales.`;
};

const openChat = () => {
  chatbot.classList.add("is-open");
  chatToggle.setAttribute("aria-expanded", "true");
  if (chatNudge) chatNudge.classList.remove("is-visible");
};

const showChatNudge = () => {
  if (!chatNudge || !chatbot || chatbot.classList.contains("is-open")) return;
  chatNudge.textContent = nudgeMessages[nudgeIndex % nudgeMessages.length];
  nudgeIndex += 1;
  chatNudge.classList.add("is-visible");
  playPopupSound();
  window.setTimeout(() => {
    if (chatNudge && !chatbot.classList.contains("is-open")) {
      chatNudge.classList.remove("is-visible");
    }
  }, 5200);
};

const startChatNudges = () => {
  if (!chatNudge || nudgeTimer) return;
  window.setTimeout(showChatNudge, 1800);
  nudgeTimer = window.setInterval(showChatNudge, 11500);
};

const startQuote = () => {
  startAdvisor("security", "Arranco una cotización asistida, pero primero hago un diagnóstico corto para no ofrecer algo genérico.");
};

const summarizeAdvisor = () => {
  const data = advisorState.answers;
  if (advisorState.mode === "app") {
    return [
      "Perfecto. Lo encuadro como proyecto de aplicación de seguridad a medida.",
      "",
      `Proceso: ${data.proceso || "a relevar"}`,
      `Usuarios: ${data.usuarios || "a definir"}`,
      `Funciones: ${data.funciones || "a definir"}`,
      `Integraciones: ${data.integracion || "a revisar"}`,
      `Contacto: ${data.contacto || "pendiente"}`,
      "",
      "El siguiente paso sería relevar el flujo real, permisos por usuario, datos que se cargan, alertas, reportes y si conviene app móvil, panel web o ambas cosas. AM lo puede pensar como herramienta operativa, no como app generica."
    ].join("\n");
  }

  return [
    "Perfecto. Te dejo una primera lectura como asesor AM:",
    "",
    `Objetivo: ${data.objetivo || "a relevar"}`,
    `Riesgo/necesidad: ${data.riesgo || "a relevar"}`,
    `Zona: ${data.zona || "a confirmar"}`,
    `Urgencia: ${data.urgencia || "a confirmar"}`,
    `Contacto: ${data.contacto || "pendiente"}`,
    "",
    "Con esto AM puede evaluar combinación de vigilancia física, camaras, alarmas, sensores, monitoreo, control de accesos, custodia o seguimiento. Si queres avanzar rapido, toca Consultar y lo llevamos a WhatsApp."
  ].join("\n");
};

const startAdvisor = (mode = "security", intro = "") => {
  openChat();
  quoteState.active = false;
  advisorState.active = true;
  advisorState.mode = mode;
  advisorState.step = 0;
  advisorState.answers = {};
  const lead =
    intro ||
    (mode === "app"
      ? "Soy BOT AM. Te ayudo a pensar una app, pero solo si esta vinculada a seguridad, monitoreo u operación."
      : "Soy BOT AM. Te hago un diagnóstico corto y te guio como asesor de seguridad.");
  addMessage(lead, "bot");
  window.setTimeout(() => addMessage(advisorFlows[mode][0].prompt, "bot"), 280);
};

const continueAdvisor = (text) => {
  const flow = advisorFlows[advisorState.mode] || advisorFlows.security;
  const current = flow[advisorState.step];
  const normalized = normalizeText(text);

  if (advisorState.mode === "app" && advisorState.step === 0 && !isSecurityContext(normalized)) {
    window.setTimeout(() => {
      addMessage("Te sigo, pero lo tengo que llevar a seguridad. Decime qué parte de seguridad u operacion queres digitalizar: monitoreo, rondines, tecnicos, clientes, flota, accesos, reportes o incidentes.", "bot");
    }, 260);
    return;
  }

  advisorState.answers[current.key] = text;
  advisorState.step += 1;

  if (advisorState.step < flow.length) {
    window.setTimeout(() => addMessage(flow[advisorState.step].prompt, "bot"), 260);
    return;
  }

  advisorState.active = false;
  window.setTimeout(() => addMessage(summarizeAdvisor(), "bot"), 300);
};

const continueQuote = (text) => {
  const step = quoteSteps[quoteState.step];
  const validation = validateQuoteAnswer(step.key, text);

  if (!validation.valid) {
    const fallback = buildHumanFallback(text, []);
    const message = validation.message || `${fallback} ${step.retry}`;
    window.setTimeout(() => addMessage(message, "bot"), 340);
    return;
  }

  quoteState.answers[step.key] = text;
  quoteState.step += 1;

  if (validation.note) {
    window.setTimeout(() => addMessage(validation.note, "bot"), 180);
  }

  if (quoteState.step < quoteSteps.length) {
    window.setTimeout(() => addMessage(quoteSteps[quoteState.step].prompt, "bot"), validation.note ? 620 : 360);
    return;
  }

  quoteState.active = false;
  window.setTimeout(() => addMessage(estimateQuote(), "bot"), 420);
  window.setTimeout(() => addMessage("Para avanzar, toca Consultar o escribi WhatsApp y te dejo el mensaje listo para enviar.", "bot"), 760);
};

const getRealAiReply = async (text) => {
  if (!shouldTryRealAi()) return "";

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8500);

  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: BOT_AM_SYSTEM_PROMPT,
        message: text,
        history: chatHistory.slice(-CHAT_HISTORY_LIMIT)
      }),
      signal: controller.signal
    });

    if (!response.ok) return "";
    const data = await response.json();
    return String(data.reply || data.message || data.text || "").trim();
  } catch (error) {
    return "";
  } finally {
    window.clearTimeout(timeout);
  }
};

const getBotReply = async (text) => {
  const normalized = normalizeText(text);

  if (["hola", "buenas", "buen dia", "buenas tardes", "buenas noches"].some((greeting) => normalized.includes(greeting))) {
    return "Hola, soy BOT AM. Soy especialista en seguridad de AM: no soy un bot generalista. Puedo diagnosticar una necesidad, orientar sobre CCTV, alarmas, monitoreo, custodia, accesos, flotas o apps de seguridad a medida. Decime qué querés proteger o que proceso queres mejorar.";
  }

  if (normalized.includes("cotizar") || normalized.includes("cotizacion") || normalized.includes("calcula")) {
    startAdvisor("security", "Dale. Antes de hablar de precio, hago un diagnóstico corto como asesor AM.");
    return "";
  }

  if (normalized.includes("whatsapp")) {
    return "Dale. Podés escribir por WhatsApp desde el botón Consultar o usar este mensaje: Hola AM Seguridad, quiero avanzar con una cotización de seguridad.";
  }

  if (normalized.includes("servicios") || normalized.includes("ofrece") || normalized.includes("hacen")) {
    return "AM Seguridad ofrece vigilancia física, seguridad electronica, alarmas, camaras, monitoreo 24/7, control de accesos, seguimiento satelital, custodia de mercaderia, seguridad patrimonial, investigaciones y desarrollo de aplicaciones a medida para clientes. Decime si es para hogar, comercio, empresa, flota o un sistema interno y te recomiendo una combinación.";
  }

  if (isAppIntent(normalized)) {
    startAdvisor("app", buildAppSecurityReply(normalized));
    return "";
  }

  if (detectCommercialSignal(normalized) !== "conversation") {
    startAdvisor("security", "Te sigo. Para no responderte con algo genérico, te hago un diagnóstico corto de seguridad.");
    return "";
  }

  const realAiReply = await getRealAiReply(text);
  if (realAiReply) return realAiReply;

  if (normalized.includes("instalacion") || normalized.includes("instalar") || normalized.includes("tecnico")) {
    return "Para una instalacion profesional se empieza por relevamiento: objetivo a proteger, puntos de acceso, iluminacion, energía, red, distancias, clima, altura de montaje y protocolo de uso. Despues se define tecnologia: CCTV IP/analogico, sensores, barreras, control de accesos, panel de alarma, comunicador, respaldo electrico y mantenimiento. Decime qué querés instalar y te doy una guía más puntual.";
  }

  const scoredMatches = knowledgeBase
    .map((item) => ({
      item,
      score: item.keywords.reduce((total, keyword) => total + (normalized.includes(normalizeText(keyword)) ? 1 : 0), 0)
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  return buildHumanFallback(text, scoredMatches);
};

const submitChat = async (text) => {
  const cleanText = text.trim();
  if (!cleanText) return;

  addMessage(cleanText, "user");
  rememberMessage("user", cleanText);

  if (quoteState.active) {
    continueQuote(cleanText);
    return;
  }

  if (advisorState.active) {
    continueAdvisor(cleanText);
    return;
  }

  const thinkingMessage = showThinking();
  const reply = await getBotReply(cleanText);
  window.setTimeout(() => {
    removeThinking(thinkingMessage);
    if (reply) {
      addMessage(reply, "bot");
      rememberMessage("assistant", reply);
    }
  }, 420);
};

if (chatbot && chatToggle && chatClose && chatForm) {
  syncPopupAudioButton();

  chatToggle.addEventListener("click", () => {
    const isOpen = chatbot.classList.toggle("is-open");
    chatToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen && chatNudge) chatNudge.classList.remove("is-visible");
  });

  chatClose.addEventListener("click", () => {
    chatbot.classList.remove("is-open");
    chatToggle.setAttribute("aria-expanded", "false");
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = chatForm.elements.message;
    submitChat(input.value);
    input.value = "";
    input.focus();
  });

  chatSuggestions.forEach((button) => {
    button.addEventListener("click", () => {
      openChat();
      submitChat(button.dataset.chatSuggestion || button.textContent);
    });
  });

  chatStarts.forEach((button) => {
    button.addEventListener("click", startQuote);
  });

  if (chatNudge) {
    chatNudge.addEventListener("click", () => {
      openChat();
      playPopupSound();
    });
  }

  if (chatAudioToggle) {
    chatAudioToggle.addEventListener("click", () => {
      popupAudioEnabled = !popupAudioEnabled;
      try {
        localStorage.setItem("botAmPopupAudio", popupAudioEnabled ? "on" : "off");
      } catch (error) {
        // The preference is optional; the button still works for the current session.
      }
      syncPopupAudioButton();
    });
  }

  startChatNudges();
}
