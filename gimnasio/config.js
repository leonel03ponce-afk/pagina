/* =====================================================================
   CONFIGURACIÓN DEL GIMNASIO
   Todo el contenido de la página sale de acá. Para actualizar precios,
   horarios o clases, editá este archivo y nada más.
   ===================================================================== */
window.SITE = {
  nombre: "FORJA",
  eslogan: "Forjá tu mejor versión",
  descripcion: "Fuerza, funcional y clases grupales con coaches certificados. Sin contratos, sin vueltas: venís, entrenás, avanzás.",

  // WhatsApp en formato internacional, sin + ni espacios (54 9 + característica + número)
  whatsapp: "5491100000000",
  telefonoVisible: "11 0000-0000",
  instagram: "forja.gym",
  direccion: "Av. Siempre Viva 742, Buenos Aires",
  // Lo que se busca en Google Maps para el mapa y el botón "Cómo llegar"
  mapa: "Obelisco, Buenos Aires",

  // Horario del salón. 0 = domingo, 1 = lunes ... 6 = sábado. null = cerrado.
  horario: {
    0: null,
    1: ["06:00", "23:00"],
    2: ["06:00", "23:00"],
    3: ["06:00", "23:00"],
    4: ["06:00", "23:00"],
    5: ["06:00", "23:00"],
    6: ["08:00", "20:00"],
  },

  // Imagen principal (podés poner la URL de una foto del cliente)
  fotoPortada: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=2000&q=80&auto=format&fit=crop",

  numeros: [
    { valor: 1200, sufijo: "+", texto: "socios activos" },
    { valor: 40, sufijo: "", texto: "clases por semana" },
    { valor: 12, sufijo: "", texto: "coaches certificados" },
    { valor: 900, sufijo: " m²", texto: "de salón equipado" },
  ],

  // Descuento por pagar 3 meses juntos (en %). Poné 0 para ocultar la opción.
  descuentoTrimestral: 10,

  planes: [
    {
      id: "base",
      nombre: "Base",
      precio: 28000,
      bajada: "Para arrancar con el pie derecho",
      incluye: ["Musculación libre", "Hasta 3 veces por semana", "Rutina inicial con coach"],
    },
    {
      id: "full",
      nombre: "Full",
      precio: 38000,
      bajada: "Todo el gimnasio, todos los días",
      destacado: true,
      incluye: ["Musculación libre ilimitada", "Todas las clases grupales", "Evaluación física mensual", "App de rutinas"],
    },
    {
      id: "personal",
      nombre: "Personal",
      precio: 75000,
      bajada: "Resultados a tu medida",
      incluye: ["Todo el plan Full", "8 sesiones con coach personal", "Plan de alimentación", "Seguimiento por WhatsApp"],
    },
  ],

  // Clases grupales. dia: 1 = lunes ... 6 = sábado, 0 = domingo. duracion en minutos.
  clases: [
    { nombre: "Funcional", dia: 1, hora: "07:00", duracion: 50, coach: "Nico" },
    { nombre: "Spinning", dia: 1, hora: "09:00", duracion: 45, coach: "Agus" },
    { nombre: "Funcional", dia: 1, hora: "12:00", duracion: 50, coach: "Nico" },
    { nombre: "Crossfit", dia: 1, hora: "18:00", duracion: 60, coach: "Lu" },
    { nombre: "Funcional", dia: 1, hora: "19:00", duracion: 50, coach: "Nico" },
    { nombre: "Spinning", dia: 1, hora: "19:30", duracion: 45, coach: "Agus" },

    { nombre: "Funcional", dia: 2, hora: "07:00", duracion: 50, coach: "Nico" },
    { nombre: "Spinning", dia: 2, hora: "09:00", duracion: 45, coach: "Agus" },
    { nombre: "Boxeo", dia: 2, hora: "18:00", duracion: 60, coach: "Rama" },
    { nombre: "Funcional", dia: 2, hora: "19:00", duracion: 50, coach: "Nico" },
    { nombre: "Boxeo", dia: 2, hora: "21:00", duracion: 60, coach: "Rama" },

    { nombre: "Funcional", dia: 3, hora: "07:00", duracion: 50, coach: "Nico" },
    { nombre: "Crossfit", dia: 3, hora: "08:00", duracion: 60, coach: "Lu" },
    { nombre: "Spinning", dia: 3, hora: "09:00", duracion: 45, coach: "Agus" },
    { nombre: "Funcional", dia: 3, hora: "19:00", duracion: 50, coach: "Nico" },
    { nombre: "Crossfit", dia: 3, hora: "20:00", duracion: 60, coach: "Lu" },

    { nombre: "Funcional", dia: 4, hora: "07:00", duracion: 50, coach: "Nico" },
    { nombre: "Spinning", dia: 4, hora: "09:00", duracion: 45, coach: "Agus" },
    { nombre: "Boxeo", dia: 4, hora: "18:00", duracion: 60, coach: "Rama" },
    { nombre: "Funcional", dia: 4, hora: "19:00", duracion: 50, coach: "Nico" },
    { nombre: "Boxeo", dia: 4, hora: "21:00", duracion: 60, coach: "Rama" },

    { nombre: "Funcional", dia: 5, hora: "07:00", duracion: 50, coach: "Nico" },
    { nombre: "Crossfit", dia: 5, hora: "08:00", duracion: 60, coach: "Lu" },
    { nombre: "Funcional", dia: 5, hora: "12:00", duracion: 50, coach: "Nico" },
    { nombre: "Funcional", dia: 5, hora: "19:00", duracion: 50, coach: "Nico" },
    { nombre: "Crossfit", dia: 5, hora: "20:00", duracion: 60, coach: "Lu" },

    { nombre: "Spinning", dia: 6, hora: "09:00", duracion: 45, coach: "Agus" },
    { nombre: "Yoga", dia: 6, hora: "10:00", duracion: 60, coach: "Cami" },
    { nombre: "Funcional", dia: 6, hora: "11:00", duracion: 50, coach: "Nico" },
  ],

  programas: [
    { nombre: "Musculación", etiqueta: "Fuerza", texto: "Rutinas personalizadas, máquinas nuevas y seguimiento de tu progreso.", foto: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop" },
    { nombre: "Clases grupales", etiqueta: "Energía", texto: "Funcional, crossfit, boxeo, spinning y yoga en grupos reducidos.", foto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80&auto=format&fit=crop" },
    { nombre: "Entrenamiento personal", etiqueta: "A medida", texto: "Un coach solo para vos, con plan de alimentación incluido.", foto: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=80&auto=format&fit=crop" },
  ],

  opiniones: [
    { nombre: "Martina G.", texto: "Probé varios gimnasios del barrio y este es otro nivel. Los coaches te corrigen de verdad.", estrellas: 5 },
    { nombre: "Lucas R.", texto: "En tres meses bajé 8 kilos con el plan Personal. El seguimiento hace toda la diferencia.", estrellas: 5 },
    { nombre: "Sofía P.", texto: "Las clases de funcional son lo mejor del día. Buena música, buena onda y siempre limpio.", estrellas: 5 },
  ],
  puntajeGoogle: "4,9",
  cantidadResenas: 312,

  preguntas: [
    { p: "¿La primera clase es gratis de verdad?", r: "Sí. Reservás por WhatsApp, venís, entrenás y después decidís. No te pedimos tarjeta ni datos de pago." },
    { p: "¿Hay matrícula o permanencia mínima?", r: "No. Pagás mes a mes y podés darte de baja cuando quieras, sin costo." },
    { p: "¿Qué medios de pago aceptan?", r: "Efectivo, transferencia, Mercado Pago y tarjetas de débito y crédito." },
    { p: "Nunca entrené, ¿es para mí?", r: "Totalmente. En tu primera semana un coach te arma una rutina según tu nivel y te enseña cada ejercicio." },
    { p: "¿Necesito apto médico?", r: "Sí, te lo pedimos dentro del primer mes. Si no tenés, te recomendamos dónde hacerlo." },
    { p: "¿Tienen duchas y lockers?", r: "Sí, vestuarios con duchas con agua caliente y lockers con candado." },
  ],
};
