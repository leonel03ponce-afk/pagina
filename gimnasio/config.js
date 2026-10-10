/* =====================================================================
   CONFIGURACIÓN DEL GIMNASIO
   Todo el contenido y el diseño de la página salen de acá.
   Podés editarlo a mano o con editor.html (vista previa en vivo).
   ===================================================================== */
window.SITE = {
  negocio: {
    nombre: "FORJA",
    eslogan: "Forjá tu mejor versión",
    descripcion: "Fuerza, funcional y clases grupales con coaches certificados. Sin contratos, sin vueltas: venís, entrenás, avanzás.",
    logo: "",                      // URL de una imagen. Vacío = se usa el nombre como logo.
    whatsapp: "5491100000000",     // 549 + característica + número, sin + ni espacios
    instagram: "forja.gym",
    direccion: "Av. Siempre Viva 742, Buenos Aires",
    mapa: "Obelisco, Buenos Aires", // lo que se busca en Google Maps
  },

  // estilo: "neon" | "fuego" | "oceano" | "oro" | "claro"
  // acento: color principal (vacío = el del estilo). tipografia: "impacto" | "moderna" | "condensada"
  tema: { estilo: "neon", acento: "", tipografia: "impacto" },

  // Qué secciones se muestran y en qué orden. Borrá una para ocultarla.
  secciones: ["portada", "numeros", "programas", "horarios", "afluencia", "recomendador", "planes", "resultados", "coaches", "galeria", "calculadora", "opiniones", "preguntas", "ubicacion", "cierre"],

  // Barra superior de promoción. "hasta" (AAAA-MM-DD) muestra cuenta regresiva y la oculta al vencer.
  aviso: { texto: "Promo primavera: 20% off en el plan trimestral", hasta: "2026-11-30", link: "#planes" },

  portada: {
    etiqueta: "Primera clase gratis · sin matrícula",
    foto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2000&q=80&auto=format&fit=crop",
    video: "", // URL de un .mp4 corto (opcional, reemplaza la foto)
  },

  // 0 = domingo, 1 = lunes ... 6 = sábado. null = cerrado.
  horario: {
    0: null,
    1: ["06:00", "23:00"],
    2: ["06:00", "23:00"],
    3: ["06:00", "23:00"],
    4: ["06:00", "23:00"],
    5: ["06:00", "23:00"],
    6: ["08:00", "20:00"],
  },
  feriados: [
    { fecha: "2026-11-23", motivo: "Feriado nacional" },
    { fecha: "2026-12-25", motivo: "Navidad" },
    { fecha: "2027-01-01", motivo: "Año Nuevo" },
  ],

  /* Cuánta gente suele haber, de 0 (vacío) a 5 (lleno), hora por hora desde la apertura.
     "semana" = lunes a viernes, "sabado" y "domingo" aparte. */
  afluencia: {
    semana: [2, 4, 5, 3, 2, 2, 3, 3, 2, 1, 1, 2, 3, 5, 5, 4, 3],
    sabado: [2, 3, 4, 4, 3, 2, 2, 1, 1, 1, 1, 1],
    domingo: [],
  },

  // Antes y después de socios (dos fotos de la misma persona)
  resultados: [
    { nombre: "Lucas, 32", texto: "-14 kg en 6 meses con plan Personal", antes: "", despues: "" },
    { nombre: "Caro, 27", texto: "+6 kg de masa muscular en 1 año", antes: "", despues: "" },
  ],

  // Texto que se comparte con "Invitá a un amigo"
  invitacion: "Vení a entrenar conmigo a FORJA, la primera clase es gratis 💪",

  numeros: [
    { valor: 1200, sufijo: "+", texto: "socios activos" },
    { valor: 40, sufijo: "", texto: "clases por semana" },
    { valor: 12, sufijo: "", texto: "coaches certificados" },
    { valor: 900, sufijo: " m²", texto: "de salón equipado" },
  ],

  programas: [
    { nombre: "Musculación", etiqueta: "Fuerza", texto: "Rutinas personalizadas, máquinas nuevas y seguimiento de tu progreso.", foto: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop" },
    { nombre: "Clases grupales", etiqueta: "Energía", texto: "Funcional, crossfit, boxeo, spinning y yoga en grupos reducidos.", foto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop" },
    { nombre: "Entrenamiento personal", etiqueta: "A medida", texto: "Un coach solo para vos, con plan de alimentación incluido.", foto: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=80&auto=format&fit=crop" },
  ],

  // dia: 1 = lunes ... 6 = sábado, 0 = domingo. duracion en minutos.
  clases: [
    { dia: 1, hora: "07:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 1, hora: "09:00", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 1, hora: "12:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 1, hora: "18:00", nombre: "Crossfit", coach: "Lu", duracion: 60 },
    { dia: 1, hora: "19:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 1, hora: "19:30", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 2, hora: "07:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 2, hora: "09:00", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 2, hora: "18:00", nombre: "Boxeo", coach: "Rama", duracion: 60 },
    { dia: 2, hora: "19:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 2, hora: "21:00", nombre: "Boxeo", coach: "Rama", duracion: 60 },
    { dia: 3, hora: "07:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 3, hora: "08:00", nombre: "Crossfit", coach: "Lu", duracion: 60 },
    { dia: 3, hora: "09:00", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 3, hora: "19:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 3, hora: "20:00", nombre: "Crossfit", coach: "Lu", duracion: 60 },
    { dia: 4, hora: "07:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 4, hora: "09:00", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 4, hora: "18:00", nombre: "Boxeo", coach: "Rama", duracion: 60 },
    { dia: 4, hora: "19:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 4, hora: "21:00", nombre: "Boxeo", coach: "Rama", duracion: 60 },
    { dia: 5, hora: "07:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 5, hora: "08:00", nombre: "Crossfit", coach: "Lu", duracion: 60 },
    { dia: 5, hora: "12:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 5, hora: "19:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
    { dia: 5, hora: "20:00", nombre: "Crossfit", coach: "Lu", duracion: 60 },
    { dia: 6, hora: "09:00", nombre: "Spinning", coach: "Agus", duracion: 45 },
    { dia: 6, hora: "10:00", nombre: "Yoga", coach: "Cami", duracion: 60 },
    { dia: 6, hora: "11:00", nombre: "Funcional", coach: "Nico", duracion: 50 },
  ],

  // linkPago: link de pago de Mercado Pago (opcional). Si está, aparece el botón "Pagar online".
  planes: [
    { id: "base", nombre: "Base", precio: 28000, bajada: "Para arrancar con el pie derecho", incluye: ["Musculación libre", "Hasta 3 veces por semana", "Rutina inicial con coach"], linkPago: "" },
    { id: "full", nombre: "Full", precio: 38000, bajada: "Todo el gimnasio, todos los días", destacado: true, incluye: ["Musculación libre ilimitada", "Todas las clases grupales", "Evaluación física mensual", "App de rutinas"], linkPago: "" },
    { id: "personal", nombre: "Personal", precio: 75000, bajada: "Resultados a tu medida", incluye: ["Todo el plan Full", "8 sesiones con coach personal", "Plan de alimentación", "Seguimiento por WhatsApp"], linkPago: "" },
  ],
  descuentoTrimestral: 20, // % por pagar 3 meses. 0 = sin opción trimestral.
  paseDiario: 6000,        // precio de un día suelto. 0 = no se muestra.
  mediosDePago: "Efectivo · Transferencia · Mercado Pago · Débito y crédito",

  coaches: [
    { nombre: "Nico", especialidad: "Funcional y fuerza", foto: "", instagram: "" },
    { nombre: "Lu", especialidad: "Crossfit y halterofilia", foto: "", instagram: "" },
    { nombre: "Rama", especialidad: "Boxeo", foto: "", instagram: "" },
    { nombre: "Agus", especialidad: "Spinning y cardio", foto: "", instagram: "" },
    { nombre: "Cami", especialidad: "Yoga y movilidad", foto: "", instagram: "" },
  ],

  galeria: [
    { titulo: "Sala de musculación", foto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop" },
    { titulo: "Zona funcional", foto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80&auto=format&fit=crop" },
    { titulo: "Pesos libres", foto: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1400&q=80&auto=format&fit=crop" },
    { titulo: "Entrenamiento", foto: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400&q=80&auto=format&fit=crop" },
    { titulo: "Boxeo", foto: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1400&q=80&auto=format&fit=crop" },
  ],

  opiniones: [
    { nombre: "Martina G.", texto: "Probé varios gimnasios del barrio y este es otro nivel. Los coaches te corrigen de verdad.", estrellas: 5 },
    { nombre: "Lucas R.", texto: "En tres meses bajé 8 kilos con el plan Personal. El seguimiento hace toda la diferencia.", estrellas: 5 },
    { nombre: "Sofía P.", texto: "Las clases de funcional son lo mejor del día. Buena música, buena onda y siempre limpio.", estrellas: 5 },
  ],
  puntajeGoogle: "4,9",
  cantidadResenas: 312,
  linkResenas: "", // link para dejar reseña en Google (opcional)

  preguntas: [
    { p: "¿La primera clase es gratis de verdad?", r: "Sí. Reservás, venís, entrenás y después decidís. No te pedimos tarjeta ni datos de pago." },
    { p: "¿Hay matrícula o permanencia mínima?", r: "No. Pagás mes a mes y podés darte de baja cuando quieras, sin costo." },
    { p: "¿Qué medios de pago aceptan?", r: "Efectivo, transferencia, Mercado Pago y tarjetas de débito y crédito." },
    { p: "Nunca entrené, ¿es para mí?", r: "Totalmente. En tu primera semana un coach te arma una rutina según tu nivel y te enseña cada ejercicio." },
    { p: "¿Necesito apto médico?", r: "Sí, te lo pedimos dentro del primer mes. Si no tenés, te recomendamos dónde hacerlo." },
    { p: "¿Tienen duchas y lockers?", r: "Sí, vestuarios con duchas con agua caliente y lockers con candado." },
  ],

  /* Planilla de Google (opcional): el dueño actualiza clases, planes o la promo desde
     una planilla y la web se actualiza sola. En Google Sheets: Archivo > Compartir >
     Publicar en la web > elegí la hoja > formato CSV, y pegá el link acá.
     Columnas esperadas:
       clases: dia | hora | clase | coach | duracion
       planes: nombre | precio | bajada | incluye (separado por ;) | destacado (si/no) | linkPago
       aviso:  texto | hasta | link                                                        */
  planilla: { clases: "", planes: "", aviso: "" },
};
