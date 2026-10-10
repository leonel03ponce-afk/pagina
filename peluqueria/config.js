/* =====================================================================
   CONFIGURACIÓN DE LA PELUQUERÍA
   Todo el contenido de la página sale de acá. Para actualizar precios,
   servicios, equipo u horarios, editá este archivo y nada más.
   ===================================================================== */
window.SITE = {
  nombre: "Maison Lumière",
  rubro: "Peluquería & Estética",
  bajada: "Cortes, color y tratamientos pensados para tu tipo de cabello. Un espacio tranquilo, productos premium y manos expertas.",
  desde: 2012,

  // WhatsApp en formato internacional, sin + ni espacios
  whatsapp: "5491100000000",
  instagram: "maisonlumiere.salon",
  direccion: "Calle Ejemplo 1234, Palermo, Buenos Aires",
  mapa: "Plaza Serrano, Palermo, Buenos Aires",

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
  // Días que no se trabaja (AAAA-MM-DD)
  feriados: ["2026-12-08", "2026-12-25", "2027-01-01"],
  intervaloTurnos: 30,     // cada cuántos minutos se ofrece un turno
  diasParaReservar: 21,    // cuántos días hacia adelante se puede pedir turno
  anticipacionMinima: 90,  // minutos mínimos para pedir un turno para hoy

  descuentoPrimeraVez: 10, // % para clientes nuevos. 0 para ocultar.

  fotoPortada: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80&auto=format&fit=crop",

  // duracion en minutos
  servicios: [
    { id: "corte-mujer", categoria: "Cortes", nombre: "Corte & brushing", precio: 18000, duracion: 60, detalle: "Diagnóstico, lavado, corte personalizado y peinado." },
    { id: "corte-hombre", categoria: "Cortes", nombre: "Corte masculino", precio: 12000, duracion: 30, detalle: "Tijera o máquina, lavado y styling." },
    { id: "barba", categoria: "Cortes", nombre: "Perfilado de barba", precio: 7000, duracion: 30, detalle: "Navaja, toalla caliente y aceite." },
    { id: "color", categoria: "Color", nombre: "Color completo", precio: 38000, duracion: 120, detalle: "Coloración sin amoníaco, cubre canas." },
    { id: "balayage", categoria: "Color", nombre: "Balayage", precio: 65000, duracion: 180, detalle: "Iluminación a mano alzada con matizado incluido." },
    { id: "reflejos", categoria: "Color", nombre: "Reflejos", precio: 45000, duracion: 150, detalle: "Mechas finas para dar luz y movimiento." },
    { id: "keratina", categoria: "Tratamientos", nombre: "Keratina", precio: 55000, duracion: 150, detalle: "Alisado y nutrición profunda, hasta 4 meses." },
    { id: "nutricion", categoria: "Tratamientos", nombre: "Nutrición intensiva", precio: 16000, duracion: 45, detalle: "Hidratación profunda con ampolla y masaje." },
    { id: "peinado", categoria: "Peinados", nombre: "Peinado de evento", precio: 30000, duracion: 75, detalle: "Recogidos y ondas para fiestas y eventos." },
    { id: "novia", categoria: "Peinados", nombre: "Novia (con prueba)", precio: 95000, duracion: 120, detalle: "Prueba previa + peinado el día del evento." },
  ],

  // categorias: qué tipo de servicios hace cada uno
  equipo: [
    { nombre: "Valentina Ruiz", rol: "Fundadora · Especialista en color", categorias: ["Color", "Cortes", "Tratamientos"], foto: "" },
    { nombre: "Tomás Ibarra", rol: "Cortes y barbería", categorias: ["Cortes"], foto: "" },
    { nombre: "Camila Sosa", rol: "Peinados y tratamientos", categorias: ["Peinados", "Tratamientos", "Cortes"], foto: "" },
  ],

  // Antes y después (dos fotos del mismo trabajo)
  antesDespues: {
    titulo: "Balayage miel sobre castaño",
    antes: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop&sat=-100",
    despues: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80&auto=format&fit=crop",
  },

  galeria: [
    { titulo: "Balayage", foto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=900&q=80&auto=format&fit=crop" },
    { titulo: "Corte bob", foto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=900&q=80&auto=format&fit=crop" },
    { titulo: "Peinado", foto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=900&q=80&auto=format&fit=crop" },
    { titulo: "Barbería", foto: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80&auto=format&fit=crop" },
  ],

  giftCards: [20000, 40000, 60000, 100000],

  opiniones: [
    { nombre: "Florencia M.", texto: "Salí con el pelo que siempre quise. Te escuchan, te asesoran y el ambiente es divino." },
    { nombre: "Agustina L.", texto: "Mi balayage quedó perfecto y me duró muchísimo. Valentina es una genia." },
    { nombre: "Julián P.", texto: "El mejor corte que me hice en años. Puntuales y súper prolijos." },
  ],
  puntajeGoogle: "4,9",
  cantidadResenas: 486,

  preguntas: [
    { p: "¿Cómo confirmo mi turno?", r: "Elegís servicio, día y horario en la página y nos llega tu pedido por WhatsApp. Te confirmamos en minutos dentro del horario de atención." },
    { p: "¿Puedo cancelar o cambiar el turno?", r: "Sí, avisanos por WhatsApp con al menos 24 horas de anticipación y lo reprogramamos sin cargo." },
    { p: "¿Cuánto dura un balayage?", r: "Entre 2 y 3 horas según el largo y el color de base. Te recomendamos venir con el pelo sin lavar del día." },
    { p: "¿Qué medios de pago aceptan?", r: "Efectivo, transferencia, Mercado Pago y tarjetas. Con efectivo o transferencia tenés 10% de descuento." },
    { p: "¿Los precios pueden variar?", r: "Los precios son orientativos para largo medio. Para pelo muy largo o abundante te pasamos el valor exacto antes de empezar." },
  ],
};
