/* =====================================================================
   CONFIGURACIÓN DE LA PELUQUERÍA
   Todo el contenido y el diseño de la página salen de acá.
   Podés editarlo a mano o con editor.html (vista previa en vivo).
   ===================================================================== */
window.SITE = {
  negocio: {
    nombre: "Maison Lumière",
    rubro: "Peluquería & Estética",
    // Título de portada: "|" corta la línea y *palabra* la resalta en cursiva.
    eslogan: "El arte de|sentirte *vos*|misma.",
    descripcion: "Cortes, color y tratamientos pensados para tu tipo de cabello. Un espacio tranquilo, productos premium y manos expertas.",
    desde: 2012,
    logo: "",
    whatsapp: "5491100000000",
    instagram: "maisonlumiere.salon",
    direccion: "Calle Ejemplo 1234, Palermo, Buenos Aires",
    mapa: "Plaza Serrano, Palermo, Buenos Aires",
  },

  // estilo: "crema" | "noche" | "rosa" | "salvia" | "minimal". tipografia: "elegante" | "clasica" | "moderna"
  tema: { estilo: "crema", acento: "", tipografia: "elegante" },

  secciones: ["portada", "servicios", "turnos", "combos", "trabajos", "equipo", "fidelidad", "regalo", "opiniones", "preguntas", "ubicacion"],

  aviso: { texto: "Octubre: 15% off en balayage reservando online", hasta: "2026-10-31", link: "#turnos" },

  portada: { etiqueta: "", foto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&auto=format&fit=crop" },

  // 0 = domingo ... 6 = sábado. null = cerrado.
  horario: {
    0: null,
    1: null,
    2: ["10:00", "20:00"],
    3: ["10:00", "20:00"],
    4: ["10:00", "20:00"],
    5: ["10:00", "20:00"],
    6: ["09:00", "18:00"],
  },
  feriados: [
    { fecha: "2026-11-23", motivo: "Feriado nacional" },
    { fecha: "2026-12-08", motivo: "Feriado nacional" },
    { fecha: "2026-12-25", motivo: "Navidad" },
  ],

  turnos: {
    intervalo: 30,            // cada cuántos minutos se ofrece un turno
    diasParaReservar: 21,     // cuántos días hacia adelante
    anticipacionMinima: 90,   // minutos mínimos para un turno de hoy
    sena: 0,                  // % de seña para confirmar (0 = sin seña)
    linkSena: "",             // link de Mercado Pago para la seña
  },
  descuentoPrimeraVez: 10,    // % para clientes nuevos (0 = ocultar)

  // Multiplicador de precio según el largo del pelo (solo servicios con porLargo: true)
  largos: [
    { nombre: "Corto", factor: 1 },
    { nombre: "Medio", factor: 1.15 },
    { nombre: "Largo", factor: 1.3 },
  ],

  // duracion en minutos. porLargo: el precio cambia según el largo.
  servicios: [
    { id: "corte-mujer", categoria: "Cortes", nombre: "Corte & brushing", precio: 18000, duracion: 60, detalle: "Diagnóstico, lavado, corte personalizado y peinado.", porLargo: true },
    { id: "corte-hombre", categoria: "Cortes", nombre: "Corte masculino", precio: 12000, duracion: 30, detalle: "Tijera o máquina, lavado y styling." },
    { id: "barba", categoria: "Cortes", nombre: "Perfilado de barba", precio: 7000, duracion: 30, detalle: "Navaja, toalla caliente y aceite." },
    { id: "color", categoria: "Color", nombre: "Color completo", precio: 38000, duracion: 120, detalle: "Coloración sin amoníaco, cubre canas.", porLargo: true },
    { id: "balayage", categoria: "Color", nombre: "Balayage", precio: 65000, duracion: 180, detalle: "Iluminación a mano alzada con matizado incluido.", porLargo: true },
    { id: "reflejos", categoria: "Color", nombre: "Reflejos", precio: 45000, duracion: 150, detalle: "Mechas finas para dar luz y movimiento.", porLargo: true },
    { id: "keratina", categoria: "Tratamientos", nombre: "Keratina", precio: 55000, duracion: 150, detalle: "Alisado y nutrición profunda, hasta 4 meses.", porLargo: true },
    { id: "nutricion", categoria: "Tratamientos", nombre: "Nutrición intensiva", precio: 16000, duracion: 45, detalle: "Hidratación profunda con ampolla y masaje." },
    { id: "peinado", categoria: "Peinados", nombre: "Peinado de evento", precio: 30000, duracion: 75, detalle: "Recogidos y ondas para fiestas y eventos." },
    { id: "novia", categoria: "Peinados", nombre: "Novia (con prueba)", precio: 95000, duracion: 120, detalle: "Prueba previa + peinado el día del evento." },
  ],

  // Combos: se aplican solos cuando el cliente elige todos sus servicios.
  combos: [
    { nombre: "Renovación total", servicios: ["corte-mujer", "color"], descuento: 15, texto: "Corte y color en una sola visita." },
    { nombre: "Brillo intenso", servicios: ["balayage", "nutricion"], descuento: 20, texto: "Balayage con nutrición para que el color dure más." },
    { nombre: "Caballero", servicios: ["corte-hombre", "barba"], descuento: 15, texto: "Corte y barba con toalla caliente." },
  ],

  // dias: qué días trabaja (vacío = todos los días que abre el salón)
  equipo: [
    { nombre: "Valentina Ruiz", rol: "Fundadora · Especialista en color", categorias: ["Color", "Cortes", "Tratamientos"], dias: [2, 3, 4, 5, 6], foto: "" },
    { nombre: "Tomás Ibarra", rol: "Cortes y barbería", categorias: ["Cortes"], dias: [2, 4, 5, 6], foto: "" },
    { nombre: "Camila Sosa", rol: "Peinados y tratamientos", categorias: ["Peinados", "Tratamientos", "Cortes"], dias: [3, 4, 5, 6], foto: "" },
  ],

  // Turnos ya tomados (lo ideal es cargarlos desde la planilla de Google).
  // profesional vacío = bloquea a todo el salón.
  ocupados: [],

  trabajos: [
    { titulo: "Balayage miel sobre castaño", antes: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop&sat=-100", despues: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop" },
  ],
  galeria: [
    { titulo: "Balayage", foto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80&auto=format&fit=crop" },
    { titulo: "Corte bob", foto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&q=80&auto=format&fit=crop" },
    { titulo: "Peinado", foto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80&auto=format&fit=crop" },
    { titulo: "Barbería", foto: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop" },
  ],

  fidelidad: { visitas: 6, premio: "50% off", texto: "Cada 5 visitas, la sexta tiene 50% de descuento. Te llevamos la cuenta nosotros." },
  giftCards: [20000, 40000, 60000, 100000],

  opiniones: [
    { nombre: "Florencia M.", texto: "Salí con el pelo que siempre quise. Te escuchan, te asesoran y el ambiente es divino." },
    { nombre: "Agustina L.", texto: "Mi balayage quedó perfecto y me duró muchísimo. Valentina es una genia." },
    { nombre: "Julián P.", texto: "El mejor corte que me hice en años. Puntuales y súper prolijos." },
  ],
  puntajeGoogle: "4,9",
  cantidadResenas: 486,
  linkResenas: "",

  preguntas: [
    { p: "¿Cómo confirmo mi turno?", r: "Elegís servicio, día y horario en la página y nos llega tu pedido por WhatsApp. Te confirmamos en minutos dentro del horario de atención." },
    { p: "¿Puedo cancelar o cambiar el turno?", r: "Sí, avisanos por WhatsApp con al menos 24 horas de anticipación y lo reprogramamos sin cargo." },
    { p: "¿Por qué el precio cambia según el largo?", r: "Porque el pelo más largo lleva más producto y más tiempo. Elegí tu largo al reservar y te mostramos el precio estimado." },
    { p: "¿Qué medios de pago aceptan?", r: "Efectivo, transferencia, Mercado Pago y tarjetas. Con efectivo o transferencia tenés 10% de descuento." },
    { p: "¿Cuánto dura un balayage?", r: "Entre 2 y 3 horas según el largo y el color de base. Te recomendamos venir con el pelo sin lavar del día." },
  ],

  /* Planilla de Google (opcional). Archivo > Compartir > Publicar en la web > CSV.
       servicios: categoria | nombre | precio | duracion | detalle | porlargo (si/no)
       ocupados:  fecha (AAAA-MM-DD) | hora | duracion | profesional
       aviso:     texto | hasta | link                                         */
  planilla: { servicios: "", ocupados: "", aviso: "" },
};
