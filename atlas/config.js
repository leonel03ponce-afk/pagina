/* =====================================================================
   ATLAS GIMNASIO — Los Polvorines
   Datos tomados de su ficha de Google. Lo marcado como PENDIENTE hay que
   pedírselo al dueño (ver FICHA-GIMNASIO.md). Editable con editor.html.
   ===================================================================== */
window.SITE = {
  negocio: {
    nombre: "ATLAS",
    eslogan: "Entrená con tu tribu",
    descripcion: "Máquinas completas, espacio para calistenia y profes que te acompañan desde el primer día. Si te da vergüenza empezar, este es tu lugar.",
    logo: "",                       // PENDIENTE: logo del gimnasio
    whatsapp: "5491164081774",      // 011 6408-1774
    instagram: "",                  // PENDIENTE
    direccion: "Rivadavia 2764, Los Polvorines, Buenos Aires",
    mapa: "ATLAS GIMNASIO, Rivadavia 2764, Los Polvorines",
  },

  tema: { estilo: "oro", acento: "", tipografia: "impacto" },

  // Sin precios, clases ni coaches todavía: esas secciones quedan afuera hasta tener los datos.
  secciones: ["portada", "programas", "galeria", "opiniones", "calculadora", "preguntas", "ubicacion", "cierre"],

  aviso: { texto: "", hasta: "", link: "" },

  // Atlas no informó una clase gratis: el botón invita a coordinar la primera visita.
  textos: {
    boton: "Quiero entrenar",
    botonLargo: "Coordiná tu primera visita",
    etiquetaReserva: "Primera visita",
    tituloReserva: "Vení a conocernos",
    mensaje: "quiero coordinar mi primera visita al gimnasio",
    cierreKicker: "4,9 ★ en Google",
    cierreTitulo: "Tu primer día|te lo hacemos fácil",
    cierreTexto: "Elegí día y horario, y un profe te recibe y te arma la rutina. ¿Mejor de a dos? Invitá a un amigo.",
  },

  portada: {
    etiqueta: "★ 4,9 en Google · Los Polvorines",
    foto: "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Tz1AKIN-JWRYyDaQS9KI5TwzeVipgMVvGcMAIcguGYJoQ4WsRkdanqIBOovlDoSz12W3nrFt2d6aVRhV3faX_acJdKLGV55GhtcXWV633aY6R45TX3dW4JA1MLVz6RSroTDkbsKQ=w1600",
    video: "",
  },

  horario: {
    0: null,
    1: ["06:30", "22:00"],
    2: ["06:30", "22:00"],
    3: ["06:30", "22:00"],
    4: ["06:30", "22:00"],
    5: ["06:30", "22:00"],
    6: ["08:30", "13:00"],
  },
  feriados: [], // PENDIENTE: días que cierra

  afluencia: {}, // PENDIENTE: cuánta gente hay cada hora (0 a 5)
  resultados: [],
  invitacion: "Vení a entrenar conmigo a Atlas Gimnasio en Los Polvorines 💪",

  numeros: [],

  programas: [
    { nombre: "Musculación", etiqueta: "Máquinas completas", texto: "Máquinas completas y buen espacio para entrenar cómodo.", foto: "" },
    { nombre: "Calistenia", etiqueta: "Todo a mano", texto: "Barras y materiales disponibles para combinar calistenia con tu rutina de sala.", foto: "" },
    { nombre: "Primeros pasos", etiqueta: "Sin vergüenza", texto: "Si nunca entrenaste, los profes te acompañan y te enseñan cada ejercicio.", foto: "" },
  ],

  clases: [],   // PENDIENTE
  planes: [],   // PENDIENTE: nombre, precio, qué incluye
  descuentoTrimestral: 0,
  paseDiario: 0,
  mediosDePago: "",
  coaches: [],  // PENDIENTE

  galeria: [
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Tn_Y7aB74qjJ_StEh-j7Fn8F6RMTtRiHGq6gILm_myfImbr8uGEcQtKDfVgf4RmrrbcjADDVNZydEXi_1dNiYi5yDrUKan5F9wRrTu-FSpQvm8HWItVCgYmgH_qCRMTwUbHhkwfDuw4nM=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QACIqWGw6y_uteWio8VA8B0H3foILKD-JMpAW4d9c7TmotsH1LbF4N_0vD28N9ZosSXNZYGBymT-ZdG1TZ3K1m3eRgi0c2Gy7VwKtPgvC5onKbhsRS1Vn40DS0mi-bEtPB0ZE=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Th_uo-IYIR_rxS9Pc7vYRc_SbxhkFzEHqTf0D0RoO82VAdCWBfcv1iOiB2jxqu8I3QBqCMJirB0hAje3t2owC82RjHBduGLIzKQdxIn9lZEaQd2i-PZNTKE03rFB8p5inU33jF=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Rc1kwdF4DUoWkKp-sueWyxYBADUimbB4uwfU7HbP_9JqbqepSONA7a_jrAjoVBu2Smp4bumSG3zz0MMqAaqgjttY6RFke_KWu3DGvTkqTZwFDpeiIpzR8ErgYa3ah-t8dnyNmA=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SHUkIapbzyLRyWXLKhjRjXyunqlAGCF0kPvVttxdD0Z8VpeFTUEML3rvZjD4Wv1g7bbShCBOabNisw_MgnwUCNoG2Pf4TFVKkN4SLO-pdue38lxHOBx6wjVIxhr3zCc6oBheUlz-W0jz7N=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TG2IiP1_oCHOhLxWwF96vEgrmQhc87rRasWUpBRlgrU8tStyTtQ9FnQtvp2rNHgRCifV-bZFg9q8Gbg_huwM3zzm2nBgKmGx501IpOcExUztTPeB9-SI4IhT2qIaYWD1WiLoAL=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9T3E1k08A3Qx-AcKAPME3-nTsZasDjZ_9q_cnHTVZI3F0qbR0KRPQ-W6qoOPnuRnZLtTlEhM9_g8c86l0-fbmMzppcyNEK55nMekfhfUeNCOE07fGif_E-SdyXkBx9v3DAJosZ7=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QGnTdDxX3E-L48W_3zOpQ3it8TFNpXGt5ScUFxx2p2WtevyI7SAQO2tXe0xkj-UFIwlX6ODu3AyDl4EFIiblWyRnc5edNvP4Br_KzW1neyLaCjW8gfLwdk5mPcnHFzn-LvsOwE=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QMTfoa3M_wFOCXIlXnfdIXJkW-K4gc0LCMAImYWpn_Tj0171N0_2Te4sqI0pmbo3QEut55A7pCHpLtyiTjW0PUcGYSx5K_KFAXw5rz5aNERjd5VmqrfbOP0whnKVoJ-xgVSzMY=w1600",
    "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Rem2qKVb-ofHlukz7kxxwsC-Er-cf5fiOhg18-OZPI62M2NouBa0Epo3OwmrHUdxNrVI9d97MJYQppLeqVig3TW0kHrhyduNYHe-bFUG-aH7kLRjXuw6udxCE7xDdx_0BxNU7Rbw=w1600",
  ].map((foto) => ({ titulo: "Atlas Gimnasio", foto })),

  opiniones: [
    { nombre: "Daiana Landriel", texto: "Si tenés miedo de empezar a entrenar o vergüenza por ser la primera vez, Atlas es más que recomendado, la atención es increíble, siempre cuidando de todos en el Gym.", estrellas: 5 },
    { nombre: "Nazareno Doria", texto: "Muy buen gimnasio. Ideal para combinar calistenia como es en mi caso. Todos los materiales a mano. Las máquinas disponibles también. El personal es amplio y están totalmente predispuestos en cualquier momento. Recomiendo un montón.", estrellas: 5 },
    { nombre: "Gabriela Fabiana Valdez", texto: "Es un lugar donde se encuentra no solo entrenadores de excelencia y espacio cómodo. Es un maravilloso lugar donde encontrás familia! La calidad humana, el compañerismo y acompañamiento son denominador común. Más que agradecida! Feliz de ser tribu con ellos! Atlas gym es lo más 🙌💪🏼", estrellas: 5 },
  ],
  puntajeGoogle: "4,9",
  cantidadResenas: 157,
  linkResenas: "https://www.google.com/maps/place/ATLAS+GIMNASIO/@-34.5007571,-58.6927008,17z",

  preguntas: [
    { p: "Nunca entrené, ¿es para mí?", r: "Totalmente. Los profes están atentos a todos y te acompañan desde el primer día. Muchos socios empezaron con miedo o vergüenza y hoy son parte de la tribu." },
    { p: "¿Puedo hacer calistenia?", r: "Sí. Tenés todos los materiales a mano para combinar calistenia con máquinas." },
    { p: "¿Qué horarios tienen?", r: "Lunes a viernes de 6:30 a 22 h y sábados de 8:30 a 13 h. Los domingos está cerrado." },
    { p: "¿Es accesible?", r: "Sí. La entrada y el estacionamiento son accesibles para personas en silla de ruedas, y hay sanitarios." },
    { p: "¿Cuánto cuesta?", r: "Escribinos por WhatsApp y te pasamos los planes y precios vigentes." },
  ],

  planilla: { clases: "", planes: "", aviso: "" },
};
