(() => {
  const N = window.Nucleo;
  const { $, $$, esc, money, initials, toMin, nowMin, addDays, fechaCorta, etiquetaDia, DIAS, DIAS_CORTOS, ORDEN_SEMANA, ICON, reduce, PREVIEW } = N;

  const ESTILOS = {
    neon: { acento: "#c6ff3d", modo: "oscuro" },
    fuego: { acento: "#ff5a1f", modo: "oscuro" },
    oceano: { acento: "#38b6ff", modo: "oscuro" },
    oro: { acento: "#d9a441", modo: "oscuro" },
    claro: { acento: "#ff4d2e", modo: "claro" },
  };
  const TIPOGRAFIAS = {
    impacto: { familia: '"Anton"', url: "family=Anton" },
    moderna: { familia: '"Archivo Black"', url: "family=Archivo+Black" },
    condensada: { familia: '"Oswald"', url: "family=Oswald:wght@600" },
  };
  const NAV = { horarios: "Horarios", afluencia: "¿Hay gente?", planes: "Planes", coaches: "Coaches", galeria: "El gimnasio", opiniones: "Opiniones", ubicacion: "Ubicación" };
  const NIVELES = ["Vacío", "Muy tranquilo", "Tranquilo", "Algo de gente", "Bastante gente", "Lleno"];

  const TEXTOS = {
    boton: "Clase gratis", botonLargo: "Reservá tu clase gratis", etiquetaReserva: "Primera clase gratis", tituloReserva: "Reservá tu lugar",
    mensaje: "quiero reservar mi clase gratis", cierreKicker: "Sin compromiso", cierreTitulo: "Tu primera clase|corre por nuestra cuenta",
    cierreTexto: "Elegí día y horario, y te esperamos. ¿Mejor de a dos? Invitá a un amigo.",
  };
  let S, H, T, wa, timers = [];
  const ui = { dia: null, filtro: "Todas", coach: null, vista: "lista", periodo: 1, recomendado: null, resp: {}, tipoDia: null, hora: null };

  /* ---------- Datos ---------- */
  function normalizar(site) {
    const s = JSON.parse(JSON.stringify(site || {}));
    s.negocio = Object.assign({ nombre: "Gimnasio", eslogan: "Entrená mejor", descripcion: "", whatsapp: "", direccion: "", mapa: "", instagram: "" }, s.negocio);
    s.tema = Object.assign({ estilo: "neon", acento: "", tipografia: "impacto" }, s.tema);
    s.secciones = Array.isArray(s.secciones) ? s.secciones : ["portada", "horarios", "planes", "ubicacion"];
    s.portada = Object.assign({ etiqueta: "", foto: "", video: "" }, s.portada);
    s.horario = s.horario || {};
    for (const k of ["feriados", "numeros", "programas", "clases", "planes", "coaches", "galeria", "opiniones", "preguntas", "resultados"]) s[k] = Array.isArray(s[k]) ? s[k] : [];
    s.clases = s.clases.filter((c) => c && c.nombre && c.hora).map((c) => ({ ...c, dia: +c.dia, duracion: +c.duracion || 60 }));
    s.planes = s.planes.filter((p) => p && p.nombre).map((p, i) => ({ ...p, id: p.id || "plan" + i, precio: +p.precio || 0,
      incluye: Array.isArray(p.incluye) ? p.incluye : String(p.incluye || "").split(";").map((x) => x.trim()).filter(Boolean) }));
    s.descuentoTrimestral = +s.descuentoTrimestral || 0;
    s.paseDiario = +s.paseDiario || 0;
    s.afluencia = s.afluencia || {};
    return s;
  }

  /* ---------- Clases en vivo ---------- */
  const proximaFecha = (dow) => addDays(new Date(), (dow - new Date().getDay() + 7) % 7);
  function enVivo() {
    const hoy = new Date(), m = nowMin();
    if (H.cerradoEl(hoy)) return null;
    return S.clases.find((c) => c.dia === hoy.getDay() && m >= toMin(c.hora) && m < toMin(c.hora) + c.duracion);
  }
  function proximaClase() {
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const d = addDays(hoy, i);
      if (H.cerradoEl(d)) continue;
      const c = S.clases.filter((x) => x.dia === d.getDay() && (i > 0 || toMin(x.hora) > nowMin())).sort((a, b) => toMin(a.hora) - toMin(b.hora))[0];
      if (c) return { c, cuando: i === 0 ? "hoy" : i === 1 ? "mañana" : "el " + DIAS[d.getDay()].toLowerCase() };
    }
    return null;
  }
  function pintarVivo() {
    const el = $("[data-live]");
    if (!el) return;
    const v = enVivo(), p = proximaClase();
    el.innerHTML = [
      v ? `<span><span class="dot"></span>Ahora: <b>${esc(v.nombre)}</b>${v.coach ? ` con ${esc(v.coach)}` : ""}</span>` : "",
      p ? `<span>Próxima clase: <b>${esc(p.c.nombre)} ${p.cuando} ${esc(p.c.hora)}</b>${p.c.coach ? ` con ${esc(p.c.coach)}` : ""}</span>` : "",
    ].join("");
  }

  /* =====================================================================
     SECCIONES
     ===================================================================== */
  const R = {};

  R.portada = () => {
    const p = S.portada, n = S.negocio;
    const w = String(n.eslogan).split(" "), corte = Math.max(1, Math.ceil(w.length / 2)), resto = w.slice(corte);
    const media = p.video ? `<video src="${esc(p.video)}" autoplay muted loop playsinline ${p.foto ? `poster="${esc(p.foto)}"` : ""}></video>`
      : p.foto ? `<img src="${esc(p.foto)}" alt="" onerror="this.remove()">` : "";
    const items = S.clases.length ? ["Musculación", ...new Set(S.clases.map((c) => c.nombre))] : S.programas.length ? S.programas.map((x) => x.nombre) : [S.negocio.nombre];
    return `<section class="hero">
      <div class="hero-media">${media}</div>
      <div class="wrap">
        ${p.etiqueta ? `<span class="eyebrow intro">${esc(p.etiqueta)}</span>` : ""}
        <h1><span class="line"><span>${esc(w.slice(0, corte).join(" "))}</span></span>${resto.length ? `<span class="line"><span><em>${esc(resto[0])}</em> ${esc(resto.slice(1).join(" "))}</span></span>` : ""}</h1>
        <div class="hero-bottom">
          <div class="intro d1"><p>${esc(n.descripcion)}</p><p class="live" data-live></p></div>
          <div class="hero-ctas intro d2">
            <button class="btn btn-primary" data-book>${esc(T.botonLargo)} ${ICON.arrow}</button>
            ${S.secciones.includes("horarios") && S.clases.length ? `<a href="#horarios" class="btn btn-ghost">Ver horarios</a>` : S.secciones.includes("planes") ? `<a href="#planes" class="btn btn-ghost">Ver planes</a>` : ""}
          </div>
        </div>
      </div>
    </section>
    <div class="marquee" aria-hidden="true"><div class="marquee-track">${[...items, ...items, ...items, ...items].map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>`;
  };

  R.numeros = () => S.numeros.length ? `<section><div class="wrap"><div class="stats">${S.numeros.map((x, i) =>
    `<div class="stat reveal" style="--d:${i * 60}ms"><strong data-count="${+x.valor || 0}" data-suffix="${esc(x.sufijo || "")}">0</strong><small>${esc(x.texto)}</small></div>`).join("")}</div></div></section>` : "";

  R.programas = () => S.programas.length ? `<section><div class="wrap">
    <div class="head"><h2 class="reveal">Elegí cómo<br><span>entrenar</span></h2><p class="reveal" style="--d:80ms">Distintas formas de entrenar, un mismo objetivo: que te sientas más fuerte cada semana.</p></div>
    <div class="programs">${S.programas.map((p, i) => `<article class="program clip" style="--d:${i * 80}ms">
      <div class="ph">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="program-body">${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ""}<h3>${esc(p.nombre)}</h3><p>${esc(p.texto)}</p></div></article>`).join("")}</div>
  </div></section>` : "";

  /* ---------- Horarios: lista por día y grilla semanal ---------- */
  R.horarios = () => S.clases.length ? `<section id="horarios"><div class="wrap">
    <div class="head"><h2 class="reveal">Horarios<br><span>de clases</span></h2>
      <p class="reveal" style="--d:80ms">Elegí el día, filtrá por disciplina o coach y reservá tu lugar en un toque. La sala de musculación está abierta todo el horario.</p></div>
    <div class="toolbar"><div class="seg" role="group" aria-label="Vista" data-vista>
      <button data-v="lista" aria-pressed="${ui.vista === "lista"}">Por día</button><button data-v="semana" aria-pressed="${ui.vista === "semana"}">Semana completa</button></div></div>
    <div class="tabs" role="tablist" aria-label="Día" data-days></div>
    <div class="chips" data-filters></div>
    <div data-classes aria-live="polite"></div>
  </div></section>` : "";

  const diasConClases = () => ORDEN_SEMANA.filter((d) => S.clases.some((c) => c.dia === d));
  const pasaFiltro = (c) => (ui.filtro === "Todas" || c.nombre === ui.filtro) && (!ui.coach || c.coach === ui.coach);
  function pintarDias() {
    const box = $("[data-days]");
    if (!box) return;
    box.hidden = ui.vista === "semana";
    const dias = diasConClases();
    if (ui.dia === null || !dias.includes(ui.dia)) {
      const hoy = new Date().getDay();
      ui.dia = dias.includes(hoy) && !H.feriadoDe(new Date()) ? hoy : dias.find((d) => !H.feriadoDe(proximaFecha(d))) ?? dias[0];
    }
    box.innerHTML = dias.map((d) => {
      const f = proximaFecha(d), fer = H.feriadoDe(f);
      return `<button class="tab${fer ? " holiday" : ""}" role="tab" data-day="${d}" aria-selected="${d === ui.dia}">
        <small>${fer ? "Feriado" : d === new Date().getDay() ? "Hoy" : `${DIAS_CORTOS[d]} ${fechaCorta(f)}`}</small><strong>${DIAS[d]}</strong></button>`;
    }).join("");
  }
  function pintarFiltros() {
    const box = $("[data-filters]");
    if (!box) return;
    box.innerHTML = ["Todas", ...new Set(S.clases.map((c) => c.nombre))].map((f) => `<button class="chip" data-filter="${esc(f)}" aria-pressed="${f === ui.filtro}">${esc(f)}</button>`).join("") +
      (ui.coach ? `<button class="chip coach" data-clear-coach>Con ${esc(ui.coach)} ✕</button>` : "");
  }
  function pintarClases(silencioso) {
    const box = $("[data-classes]");
    if (!box) return;
    if (ui.vista === "semana") return pintarSemana(box);
    box.className = "classes" + (silencioso ? " quiet" : "");
    const f = proximaFecha(ui.dia), fer = H.feriadoDe(f), esHoy = ui.dia === new Date().getDay(), m = nowMin();
    if (fer) { box.innerHTML = `<div class="empty">El ${DIAS[ui.dia].toLowerCase()} ${fechaCorta(f)} el gimnasio está cerrado por ${esc(fer.motivo || "feriado")}.</div>`; return; }
    const lista = S.clases.filter((c) => c.dia === ui.dia && pasaFiltro(c)).sort((a, b) => toMin(a.hora) - toMin(b.hora));
    let proxima = false;
    box.innerHTML = lista.length ? lista.map((c, i) => {
      const ini = toMin(c.hora), fin = ini + c.duracion;
      let badge = "", past = false;
      if (esHoy) {
        if (m >= ini && m < fin) badge = `<span class="badge live">En curso</span>`;
        else if (m >= fin) past = true;
        else if (!proxima) { badge = `<span class="badge next">Próxima</span>`; proxima = true; }
      }
      return `<div class="class${past ? " past" : ""}" style="--d:${Math.min(i, 8) * 40}ms"><time>${esc(c.hora)}</time>
        <div><h3>${esc(c.nombre)}${badge}</h3><p>${c.duracion} min${c.coach ? ` · con ${esc(c.coach)}` : ""}</p></div>
        ${past ? "" : `<button class="btn btn-ghost btn-sm" data-book data-clase="${esc(c.nombre)}" data-dia="${c.dia}" data-hora="${esc(c.hora)}">Reservar</button>`}</div>`;
    }).join("") : `<div class="empty">No hay clases con ese filtro este día. Probá con otro día o con "Todas".</div>`;
  }
  function pintarSemana(box) {
    box.className = "week";
    const dias = diasConClases(), hoy = new Date().getDay();
    const lista = S.clases.filter(pasaFiltro);
    const horas = [...new Set(lista.map((c) => c.hora))].sort((a, b) => toMin(a) - toMin(b));
    if (!horas.length) { box.className = ""; box.innerHTML = `<div class="empty">No hay clases con ese filtro.</div>`; return; }
    box.innerHTML = `<table><thead><tr><th></th>${dias.map((d) => `<th class="${d === hoy ? "today" : ""}">${DIAS[d]}${H.feriadoDe(proximaFecha(d)) ? " · feriado" : ""}</th>`).join("")}</tr></thead>
      <tbody>${horas.map((h) => `<tr><td class="t">${esc(h)}</td>${dias.map((d) => `<td class="${d === hoy ? "today" : ""}">${lista.filter((c) => c.dia === d && c.hora === h).map((c) =>
        `<button class="slot" data-book data-clase="${esc(c.nombre)}" data-dia="${d}" data-hora="${esc(h)}" aria-label="Reservar ${esc(c.nombre)} ${DIAS[d]} ${esc(h)}">${esc(c.nombre)}<small>${c.coach ? esc(c.coach) + " · " : ""}${c.duracion}′</small></button>`).join("")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }
  function conectarHorarios() {
    if (!$("[data-days]")) return;
    pintarDias(); pintarFiltros(); pintarClases();
    $("[data-vista]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-v]"); if (!b) return;
      ui.vista = b.dataset.v;
      $$("[data-v]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      pintarDias(); pintarClases();
    });
    $("[data-days]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-day]"); if (!b) return;
      ui.dia = +b.dataset.day;
      $$("[data-day]").forEach((t) => t.setAttribute("aria-selected", t === b));
      pintarClases();
    });
    $("[data-filters]").addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-coach]")) ui.coach = null;
      else { const b = e.target.closest("[data-filter]"); if (!b) return; ui.filtro = b.dataset.filter; }
      pintarFiltros(); pintarClases();
    });
  }

  /* ---------- Afluencia ("¿hay mucha gente?") ---------- */
  const TIPOS_DIA = [["semana", "Lunes a viernes", [1, 2, 3, 4, 5]], ["sabado", "Sábado", [6]], ["domingo", "Domingo", [0]]];
  const tiposConDatos = () => TIPOS_DIA.filter(([k, , dias]) => (S.afluencia[k] || []).length && dias.some((d) => S.horario[d]));
  R.afluencia = () => tiposConDatos().length ? `<section id="afluencia"><div class="wrap">
    <div class="head"><h2 class="reveal">¿Hay mucha<br><span>gente ahora?</span></h2><p class="reveal" style="--d:80ms">Así suele estar el gimnasio hora por hora. Elegí cuándo venir más tranquilo.</p></div>
    <div class="card reveal" data-crowd>
      <div class="crowd-top"><div><span class="kicker" data-crowd-k></span><div class="crowd-now" data-crowd-now></div><p class="crowd-sub" data-crowd-sub></p></div>
        <div class="seg" role="group" aria-label="Día" data-crowd-tipo></div></div>
      <div class="bars off" data-bars role="list"></div>
      <div class="hours-axis" data-axis aria-hidden="true"></div>
      <p class="crowd-tip" data-crowd-tip aria-live="polite">Tocá una barra para ver cómo suele estar a esa hora.</p>
    </div></div></section>` : "";

  function datosDe(tipo) {
    const [, , dias] = TIPOS_DIA.find((t) => t[0] === tipo);
    const h = S.horario[dias.find((d) => S.horario[d])];
    const desde = Math.floor(toMin(h[0]) / 60), hasta = Math.ceil(toMin(h[1]) / 60);
    const niveles = S.afluencia[tipo].slice(0, hasta - desde);
    return niveles.map((v, i) => ({ hora: desde + i, nivel: Math.max(0, Math.min(5, +v || 0)) }));
  }
  function pintarAfluencia(animar) {
    const box = $("[data-crowd]");
    if (!box) return;
    const tipos = tiposConDatos();
    const hoy = new Date(), dowHoy = hoy.getDay();
    const tipoHoy = TIPOS_DIA.find((t) => t[2].includes(dowHoy))[0];
    if (!ui.tipoDia || !tipos.some((t) => t[0] === ui.tipoDia)) ui.tipoDia = tipos.some((t) => t[0] === tipoHoy) ? tipoHoy : tipos[0][0];
    $("[data-crowd-tipo]").innerHTML = tipos.map(([k, n]) => `<button data-t="${k}" aria-pressed="${k === ui.tipoDia}">${k === tipoHoy ? "Hoy" : n}</button>`).join("");
    const datos = datosDe(ui.tipoDia);
    const esHoy = ui.tipoDia === tipoHoy && !H.cerradoEl(hoy);
    const horaAhora = hoy.getHours();
    $("[data-bars]").innerHTML = datos.map((x, i) => `<button role="listitem" data-h="${x.hora}" class="${esHoy && x.hora === horaAhora ? "now" : ""}" aria-pressed="${ui.hora === x.hora}"
      aria-label="${x.hora} h: ${NIVELES[x.nivel]}"><i style="height:${Math.max(4, (x.nivel / 5) * 100)}%;--d:${i * 25}ms"></i></button>`).join("");
    $("[data-axis]").innerHTML = datos.map((x) => `<span>${x.hora}</span>`).join("");
    // Resumen: ahora y mejor momento
    const ahora = esHoy ? datos.find((x) => x.hora === horaAhora) : null;
    const futuros = datos.filter((x) => !esHoy || x.hora > horaAhora);
    const min = Math.min(...futuros.map((x) => x.nivel));
    const tranquilos = futuros.filter((x) => x.nivel === min);
    let tramo = "";
    if (tranquilos.length) {
      let ini = tranquilos[0].hora, fin = ini + 1;
      for (const x of tranquilos.slice(1)) { if (x.hora === fin) fin++; else break; }
      tramo = `${ini} a ${fin} h`;
    }
    $("[data-crowd-k]").textContent = ahora ? "Ahora mismo" : esHoy ? "Hoy" : TIPOS_DIA.find((t) => t[0] === ui.tipoDia)[1];
    $("[data-crowd-now]").textContent = ahora ? NIVELES[ahora.nivel] : esHoy ? "Cerrado ahora" : "Movimiento habitual";
    $("[data-crowd-sub]").textContent = tramo ? `Más tranquilo${esHoy ? " hoy" : ""}: ${tramo}` : esHoy ? "Por hoy ya cerramos. Mirá cómo suele estar otros días." : "";
    const bars = $("[data-bars]");
    if (animar && !reduce && !PREVIEW) { bars.classList.add("off"); requestAnimationFrame(() => requestAnimationFrame(() => bars.classList.remove("off"))); }
    else bars.classList.remove("off");
  }
  function conectarAfluencia() {
    const box = $("[data-crowd]");
    if (!box) return;
    pintarAfluencia(false);
    $("[data-bars]").classList.add("off");
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { $("[data-bars]")?.classList.remove("off"); io.disconnect(); } }, { threshold: 0.3 });
    if (PREVIEW || reduce) $("[data-bars]").classList.remove("off"); else io.observe(box);
    $("[data-crowd-tipo]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-t]"); if (!b) return;
      ui.tipoDia = b.dataset.t; ui.hora = null;
      $("[data-crowd-tip]").textContent = "Tocá una barra para ver cómo suele estar a esa hora.";
      pintarAfluencia(true);
    });
    const tip = (b) => {
      const h = +b.dataset.h, x = datosDe(ui.tipoDia).find((d) => d.hora === h);
      const clases = S.clases.filter((c) => TIPOS_DIA.find((t) => t[0] === ui.tipoDia)[2].includes(c.dia) && Math.floor(toMin(c.hora) / 60) === h);
      const nombres = [...new Set(clases.map((c) => c.nombre))];
      $("[data-crowd-tip]").innerHTML = `<b>${h} a ${h + 1} h:</b> ${NIVELES[x.nivel].toLowerCase()}${nombres.length ? ` · clases: ${esc(nombres.join(", "))}` : ""}`;
    };
    $("[data-bars]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-h]"); if (!b) return;
      ui.hora = +b.dataset.h;
      $$("[data-h]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      tip(b);
    });
    $("[data-bars]").addEventListener("pointerover", (e) => { const b = e.target.closest("[data-h]"); if (b && e.pointerType === "mouse") tip(b); });
  }

  /* ---------- Recomendador ---------- */
  R.recomendador = () => S.planes.length >= 2 ? `<section><div class="wrap">
    <div class="head"><h2 class="reveal">¿Qué plan<br><span>te conviene?</span></h2><p class="reveal" style="--d:80ms">Respondé tres preguntas y te decimos cuál es el plan ideal para vos.</p></div>
    <div class="duo reveal">
      <div class="card">
        <div class="q"><p>¿Cuál es tu objetivo?</p><div class="opts" data-q="objetivo"><button class="opt" data-v="salud">Moverme y sentirme bien</button><button class="opt" data-v="fuerza">Ganar fuerza y músculo</button><button class="opt" data-v="bajar">Bajar de peso</button></div></div>
        <div class="q"><p>¿Cuántos días por semana podés venir?</p><div class="opts" data-q="dias"><button class="opt" data-v="pocos">1 a 3</button><button class="opt" data-v="muchos">4 o más</button></div></div>
        <div class="q"><p>¿Querés que un coach te acompañe de cerca?</p><div class="opts" data-q="coach"><button class="opt" data-v="no">No, me arreglo</button><button class="opt" data-v="si">Sí, quiero seguimiento</button></div></div>
      </div>
      <div class="card result"><div class="swap" data-r><span class="kicker">Tu plan ideal</span><h3 data-r-name>—</h3>
        <p class="why" data-r-why>Elegí una opción en cada pregunta y te mostramos el resultado acá.</p><a href="#planes" class="btn btn-primary" data-r-cta hidden>Ver el plan</a></div></div>
    </div></div></section>` : "";

  function conectarRecomendador() {
    $$("[data-q]").forEach((g) => {
      if (ui.resp[g.dataset.q]) $$(".opt", g).forEach((x) => x.setAttribute("aria-pressed", x.dataset.v === ui.resp[g.dataset.q]));
      g.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b) return;
        ui.resp[g.dataset.q] = b.dataset.v;
        $$(".opt", g).forEach((x) => x.setAttribute("aria-pressed", x === b));
        if (Object.keys(ui.resp).length === 3) recomendar(true);
      });
    });
    if (Object.keys(ui.resp).length === 3) recomendar(false);
  }
  function recomendar(animar) {
    const porPrecio = [...S.planes].sort((a, b) => a.precio - b.precio);
    const medio = S.planes.find((p) => p.destacado) || porPrecio[Math.floor(porPrecio.length / 2)];
    const r = ui.resp;
    let plan, why;
    if (r.coach === "si") { plan = porPrecio[porPrecio.length - 1]; why = r.objetivo === "bajar" ? "Con un coach encima vas a ver resultados más rápido y sin lesionarte." : "Vas a tener a alguien que te arme cada rutina, te corrija y te empuje a progresar."; }
    else if (r.dias === "muchos" || r.objetivo === "bajar") { plan = medio; why = r.objetivo === "bajar" ? "Combinar sala con clases grupales es la forma más efectiva de bajar de peso." : "Si venís seguido, te conviene tenerlo todo: sala y clases sin límite."; }
    else { plan = porPrecio[0]; why = "Para entrenar a tu ritmo unas veces por semana, es lo más conveniente."; }
    ui.recomendado = plan.id;
    pintarPlanes();
    const box = $("[data-r]");
    if (!box) return;
    const pintar = () => {
      $("[data-r-name]").textContent = plan.nombre;
      $("[data-r-why]").textContent = why;
      const cta = $("[data-r-cta]");
      cta.hidden = !S.secciones.includes("planes");
      cta.href = `#plan-${plan.id}`;
      cta.textContent = `Ver plan ${plan.nombre}`;
      box.classList.remove("out");
    };
    if (!animar || reduce) return pintar();
    box.classList.add("out");
    setTimeout(pintar, 200);
  }

  /* ---------- Planes ---------- */
  R.planes = () => S.planes.length ? `<section id="planes"><div class="wrap">
    <div class="head"><h2 class="reveal">Planes<br><span>sin letra chica</span></h2>
      ${S.descuentoTrimestral > 0 ? `<div class="billing reveal" style="--d:80ms" data-billing><span class="pill"></span>
        <button aria-pressed="${ui.periodo === 1}" data-period="1">Mensual</button><button aria-pressed="${ui.periodo === 3}" data-period="3">Trimestral <em>-${S.descuentoTrimestral}%</em></button></div>` : ""}</div>
    <div class="plans" data-plans></div>
    ${S.paseDiario || S.mediosDePago ? `<div class="plan-extra reveal">${S.paseDiario ? `<span>¿Venís de visita o querés probar? <b>Pase diario ${money(S.paseDiario)}</b></span>` : ""}${S.mediosDePago ? `<span>${esc(S.mediosDePago)}</span>` : ""}</div>` : ""}
  </div></section>` : "";

  function pintarPlanes() {
    const box = $("[data-plans]");
    if (!box) return;
    const d = S.descuentoTrimestral;
    box.innerHTML = S.planes.map((p) => {
      const mensual = ui.periodo === 3 ? p.precio * (1 - d / 100) : p.precio;
      const sub = ui.periodo === 3 ? `${money(mensual * 3)} cada 3 meses · ahorrás ${money((p.precio - mensual) * 3)}` : p.bajada || "";
      const msg = `Hola! Quiero el plan ${p.nombre}${ui.periodo === 3 ? " trimestral" : ""} (${money(mensual)}/mes). ¿Cómo sigo?`;
      const acts = p.linkPago && ui.periodo === 1
        ? `<a class="btn btn-mp" href="${esc(p.linkPago)}" target="_blank" rel="noopener">Pagar online</a><a class="btn btn-ghost btn-sm" href="${wa(msg)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>`
        : `<a class="btn ${p.destacado ? "btn-primary" : "btn-ghost"}" href="${wa(msg)}" target="_blank" rel="noopener">Quiero el plan ${esc(p.nombre)}</a>`;
      return `<div class="plan${p.destacado ? " featured" : ""}${ui.recomendado === p.id ? " recommended" : ""}" id="plan-${esc(p.id)}">
        ${ui.recomendado === p.id ? `<span class="flag">Recomendado para vos</span>` : p.destacado ? `<span class="flag">Más elegido</span>` : ""}
        <h3>${esc(p.nombre)}</h3><div class="price">${money(mensual)}<small> /mes</small></div><p class="sub">${esc(sub)}</p>
        <ul>${p.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><div class="acts">${acts}</div></div>`;
    }).join("");
  }
  function moverPill() {
    const billing = $("[data-billing]");
    if (!billing) return;
    const b = $("[aria-pressed='true']", billing), pill = $(".pill", billing);
    pill.style.width = b.offsetWidth + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  function conectarPlanes() {
    pintarPlanes();
    const billing = $("[data-billing]");
    if (!billing) return;
    requestAnimationFrame(moverPill);
    billing.addEventListener("click", (e) => {
      const b = e.target.closest("[data-period]"); if (!b) return;
      ui.periodo = +b.dataset.period;
      $$("[data-period]", billing).forEach((x) => x.setAttribute("aria-pressed", x === b));
      moverPill(); pintarPlanes();
    });
  }

  /* ---------- Resultados (antes / después) ---------- */
  R.resultados = () => S.resultados.length ? `<section id="resultados"><div class="wrap">
    <div class="head"><h2 class="reveal">Resultados<br><span>reales</span></h2><p class="reveal" style="--d:80ms">Socios que se animaron. Deslizá para ver el antes y el después.</p></div>
    <div class="results">${S.resultados.map((r, i) => `<figure class="res reveal" style="--d:${i * 80}ms">${N.comparador(r)}
      <figcaption><strong>${esc(r.nombre)}</strong><span>${esc(r.texto)}</span></figcaption></figure>`).join("")}</div>
  </div></section>` : "";

  /* ---------- Coaches ---------- */
  R.coaches = () => S.coaches.length ? `<section id="coaches"><div class="wrap">
    <div class="head"><h2 class="reveal">Tu equipo<br><span>de coaches</span></h2><p class="reveal" style="--d:80ms">Profesionales que te conocen por tu nombre y te acompañan en cada entrenamiento.</p></div>
    <div class="coaches">${S.coaches.map((c, i) => {
      const tiene = S.clases.some((x) => x.coach === c.nombre) && S.secciones.includes("horarios");
      return `<article class="coach reveal" style="--d:${i * 60}ms">
        <div class="pic"><span>${esc(initials(c.nombre))}</span>${c.foto ? `<img src="${esc(c.foto)}" alt="${esc(c.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
        <div class="coach-body"><h3>${esc(c.nombre)}</h3><p>${esc(c.especialidad)}</p>
          ${tiene ? `<button class="lnk" data-coach="${esc(c.nombre)}">Ver sus clases</button>` : c.instagram ? `<a class="lnk" href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a>` : ""}</div></article>`;
    }).join("")}</div></div></section>` : "";

  function conectarCoaches() {
    $$("[data-coach]").forEach((b) => b.addEventListener("click", () => {
      ui.coach = b.dataset.coach; ui.filtro = "Todas";
      const dias = diasConClases().filter((d) => S.clases.some((c) => c.dia === d && c.coach === ui.coach));
      if (!dias.includes(ui.dia)) ui.dia = dias[0];
      pintarDias(); pintarFiltros(); pintarClases();
      $("#horarios").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }));
  }

  /* ---------- Galería ---------- */
  R.galeria = () => S.galeria.length ? `<section id="galeria"><div class="wrap">
    <div class="head"><h2 class="reveal">Conocé<br><span>el gimnasio</span></h2><p class="reveal" style="--d:80ms">Tocá una foto para verla en grande.</p></div>
    <div class="gallery">${S.galeria.map((g, i) => `<button class="shot clip" style="--d:${i * 60}ms" data-shot="${i}" aria-label="Ver ${esc(g.titulo)}">
      ${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.titulo)}" loading="lazy" onerror="this.remove()">` : ""}<span>${esc(g.titulo)}</span></button>`).join("")}</div>
  </div></section>` : "";

  /* ---------- Calculadora ---------- */
  R.calculadora = () => `<section><div class="wrap">
    <div class="head"><h2 class="reveal">Calculá tus<br><span>calorías</span></h2><p class="reveal" style="--d:80ms">Una estimación de cuánto comer por día según tu objetivo. Para un plan exacto, hablá con un coach.</p></div>
    <div class="duo reveal">
      <div class="card" data-calc>
        <div class="q"><p>Sexo</p><div class="opts" data-c="sexo"><button class="opt" data-v="m" aria-pressed="${calc.sexo === "m"}">Hombre</button><button class="opt" data-v="f" aria-pressed="${calc.sexo === "f"}">Mujer</button></div></div>
        <div class="inputs">
          <div class="field"><label for="c-edad">Edad</label><input id="c-edad" type="number" inputmode="numeric" min="14" max="90" value="${calc.edad}"></div>
          <div class="field"><label for="c-peso">Peso (kg)</label><input id="c-peso" type="number" inputmode="decimal" min="35" max="250" value="${calc.peso}"></div>
          <div class="field"><label for="c-alt">Altura (cm)</label><input id="c-alt" type="number" inputmode="numeric" min="120" max="230" value="${calc.alt}"></div>
        </div>
        <div class="field"><label for="c-act">Actividad</label><select id="c-act">${[["1.2", "Poca (trabajo sentado, sin ejercicio)"], ["1.375", "Ligera (1 a 3 entrenamientos)"], ["1.55", "Moderada (3 a 5 entrenamientos)"], ["1.725", "Alta (6 o 7 entrenamientos)"]]
          .map(([v, n]) => `<option value="${v}" ${calc.act === v ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="q"><p>Objetivo</p><div class="opts" data-c="obj">${[["bajar", "Bajar grasa"], ["mantener", "Mantener"], ["subir", "Ganar músculo"]].map(([v, n]) => `<button class="opt" data-v="${v}" aria-pressed="${calc.obj === v}">${n}</button>`).join("")}</div></div>
      </div>
      <div class="card result"><span class="kicker">Calorías por día</span><div class="kcal" data-kcal>—</div><div class="macros" data-macros></div>
        <a class="btn btn-primary" data-calc-cta target="_blank" rel="noopener">Quiero un plan con coach</a></div>
    </div></div></section>`;

  const calc = { sexo: "m", obj: "mantener", edad: 28, peso: 75, alt: 175, act: "1.55" };
  function calcular() {
    calc.edad = +$("#c-edad").value; calc.peso = +$("#c-peso").value; calc.alt = +$("#c-alt").value; calc.act = $("#c-act").value;
    const { edad, peso, alt } = calc;
    if (!(edad > 0 && peso > 0 && alt > 0)) return;
    const bmr = 10 * peso + 6.25 * alt - 5 * edad + (calc.sexo === "m" ? 5 : -161);
    const kcal = Math.round((bmr * +calc.act * { bajar: 0.8, mantener: 1, subir: 1.12 }[calc.obj]) / 10) * 10;
    const prot = Math.round(peso * (calc.obj === "mantener" ? 1.6 : 2)), grasa = Math.round(peso * 0.9);
    const carbs = Math.max(0, Math.round((kcal - prot * 4 - grasa * 9) / 4));
    const tot = prot * 4 + grasa * 9 + carbs * 4 || 1;
    $("[data-kcal]").textContent = kcal.toLocaleString("es-AR");
    $("[data-macros]").innerHTML = [["Proteína", prot, prot * 4], ["Carbohidratos", carbs, carbs * 4], ["Grasas", grasa, grasa * 9]].map(([n, g, k]) =>
      `<div class="macro"><strong>${g} g</strong><small>${n}</small><div class="bar"><i style="transform:scaleX(${(k / tot).toFixed(3)})"></i></div></div>`).join("");
    const objTxt = { bajar: "bajar grasa", mantener: "mantenerme", subir: "ganar músculo" }[calc.obj];
    $("[data-calc-cta]").href = wa(`Hola! Usé la calculadora de la web: me dio ${kcal} kcal por día para ${objTxt} (${peso} kg). Quiero un plan con coach.`);
  }
  function conectarCalculadora() {
    const box = $("[data-calc]");
    if (!box) return;
    $$("[data-c]", box).forEach((g) => g.addEventListener("click", (e) => {
      const b = e.target.closest(".opt"); if (!b) return;
      calc[g.dataset.c] = b.dataset.v;
      $$(".opt", g).forEach((x) => x.setAttribute("aria-pressed", x === b));
      calcular();
    }));
    $$("input, select", box).forEach((el) => el.addEventListener("input", calcular));
    calcular();
  }

  /* ---------- Opiniones, preguntas, ubicación, cierre ---------- */
  R.opiniones = () => S.opiniones.length ? `<section id="opiniones"><div class="wrap">
    <div class="head"><h2 class="reveal">Lo que dicen<br><span>los socios</span></h2>
      <div class="rating reveal" style="--d:80ms">${S.puntajeGoogle ? `<strong>${esc(S.puntajeGoogle)}</strong><div><span class="stars">★★★★★</span><br>${esc(S.cantidadResenas)} reseñas en Google</div>` : ""}
        ${S.linkResenas ? `<a class="btn btn-ghost btn-sm" href="${esc(S.linkResenas)}" target="_blank" rel="noopener">Dejanos tu reseña</a>` : ""}</div></div>
    <div class="quotes">${S.opiniones.map((o, i) => `<figure class="quote reveal" style="--d:${i * 60}ms"><div class="stars" aria-label="${+o.estrellas || 5} estrellas">${"★".repeat(+o.estrellas || 5)}</div>
      <blockquote><p>"${esc(o.texto)}"</p></blockquote><figcaption class="who"><span class="avatar">${esc(initials(o.nombre))}</span>${esc(o.nombre)}</figcaption></figure>`).join("")}</div>
  </div></section>` : "";

  R.preguntas = () => S.preguntas.length ? `<section id="preguntas"><div class="wrap faq">
    <div><h2 class="reveal">Preguntas<br><span>frecuentes</span></h2><p class="reveal" style="--d:80ms;color:var(--muted);margin:18px 0 22px">¿No encontrás lo que buscás? Escribinos y te respondemos al toque.</p>
      <a class="btn btn-wa reveal" style="--d:120ms" href="${wa("Hola! Tengo una consulta")}" target="_blank" rel="noopener">${ICON.wa} Preguntar por WhatsApp</a></div>
    <div>${S.preguntas.map((q) => `<details class="qa reveal"><summary>${esc(q.p)}</summary><p>${esc(q.r)}</p></details>`).join("")}</div>
  </div></section>` : "";

  R.ubicacion = () => {
    const n = S.negocio, prox = H.proximoFeriado();
    return `<section id="ubicacion"><div class="wrap"><div class="head"><h2 class="reveal">Vení a<br><span>conocernos</span></h2></div>
      <div class="visit">
        <div class="map reveal">${n.mapa ? `<iframe title="Mapa de ${esc(n.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(n.mapa)}&z=15&output=embed"></iframe>` : ""}</div>
        <div class="info reveal" style="--d:80ms">
          <div><h3>Dirección</h3><p>${esc(n.direccion)}</p></div>
          <div><h3>Horario</h3>${H.tablaHoras()}${prox ? `<p class="warn">Cerrado el ${DIAS[prox.d.getDay()].toLowerCase()} ${fechaCorta(prox.d)} · ${esc(prox.motivo || "feriado")}</p>` : ""}</div>
          <div class="actions"><a class="btn btn-ghost" data-directions target="_blank" rel="noopener">Cómo llegar</a><a class="btn btn-wa" href="${wa("Hola! Quería hacer una consulta")}" target="_blank" rel="noopener">WhatsApp</a></div>
        </div></div></div></section>`;
  };

  R.cierre = () => `<section><div class="wrap"><div class="cta reveal"><span class="eyebrow">${esc(T.cierreKicker)}</span>
    <h2>${esc(T.cierreTitulo.split("|")[0])}${T.cierreTitulo.includes("|") ? `<br><span>${esc(T.cierreTitulo.split("|")[1])}</span>` : ""}</h2><p>${esc(T.cierreTexto)}</p>
    <div class="row"><button class="btn btn-primary" data-book>${esc(T.botonLargo)}</button><button class="btn btn-ghost" data-invite>${ICON.share} Invitá a un amigo</button></div>
  </div></div></section>`;

  /* ---------- Reserva de clase gratis ---------- */
  const SALA = "Musculación (sala libre)";
  let ultima = null;
  function horasPara(clase, d, esHoy) {
    if (H.cerradoEl(d)) return [];
    const m = nowMin(), dia = d.getDay();
    if (clase === SALA) {
      const h = S.horario[dia], out = [];
      for (let t = Math.ceil(toMin(h[0]) / 60) * 60; t <= toMin(h[1]) - 60; t += 60) if (!esHoy || t > m) out.push(`${String(t / 60).padStart(2, "0")}:00`);
      return out;
    }
    return S.clases.filter((c) => c.nombre === clase && c.dia === dia && (!esHoy || toMin(c.hora) > m)).map((c) => c.hora).sort((a, b) => toMin(a) - toMin(b));
  }
  function llenarDias(preDia) {
    const fC = $("#f-class"), fD = $("#f-day"), out = [];
    for (let i = 0; i < 10 && out.length < 6; i++) { const d = addDays(new Date(), i); if (horasPara(fC.value, d, i === 0).length) out.push({ d, i }); }
    fD.innerHTML = out.map((x) => `<option value="${x.i}" data-dow="${x.d.getDay()}">${etiquetaDia(x.d, x.i)}</option>`).join("") || `<option value="">Sin días disponibles</option>`;
    if (preDia !== undefined) { const o = $$("option", fD).find((op) => +op.dataset.dow === preDia); if (o) fD.value = o.value; }
    llenarHoras();
  }
  function llenarHoras(pre) {
    const op = $("#f-day").selectedOptions[0], fH = $("#f-time");
    const horas = op && op.value !== "" ? horasPara($("#f-class").value, addDays(new Date(), +op.value), op.value === "0") : [];
    fH.innerHTML = horas.map((h) => `<option>${esc(h)}</option>`).join("") || `<option value="">—</option>`;
    if (pre && horas.includes(pre)) fH.value = pre;
  }
  function abrirReserva(btn) {
    const fC = $("#f-class");
    fC.innerHTML = [SALA, ...new Set(S.clases.map((c) => c.nombre))].map((c) => `<option>${esc(c)}</option>`).join("");
    fC.value = btn?.dataset.clase || SALA;
    fC.closest(".field").hidden = !S.clases.length;
    llenarDias(btn?.dataset.dia !== undefined ? +btn.dataset.dia : undefined);
    if (btn?.dataset.hora) llenarHoras(btn.dataset.hora);
    try { $("#f-name").value ||= localStorage.getItem("mi-nombre") || ""; } catch (e) {}
    $("[data-error]").textContent = "";
    $("[data-form-body]").hidden = false;
    $("[data-form-done]").hidden = true;
    $("[data-modal]").showModal();
    if (matchMedia("(pointer: fine)").matches) $("#f-name").focus();
  }
  const invitar = () => N.compartir({ titulo: S.negocio.nombre, texto: S.invitacion || `Vení a entrenar conmigo a ${S.negocio.nombre}, la primera clase es gratis`, url: PREVIEW ? "" : location.href.split("#")[0] });

  function conectarFijos() {
    $$("[data-icon]").forEach((el) => (el.innerHTML = ICON[el.dataset.icon]));
    $("#f-class").addEventListener("change", () => llenarDias());
    $("#f-day").addEventListener("change", () => llenarHoras());
    $("#f-name").addEventListener("input", () => ($("[data-error]").textContent = ""));
    $("[data-close]").addEventListener("click", () => $("[data-modal]").close());
    $("[data-modal]").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    $("[data-ics]").addEventListener("click", () => ultima && N.descargarICS({ titulo: `${ultima.clase} en ${S.negocio.nombre}`, inicio: ultima.inicio, fin: ultima.fin, lugar: S.negocio.direccion, archivo: "mi-clase.ics" }));
    $("[data-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#f-name").value.trim(), hora = $("#f-time").value;
      if (!nombre) { $("[data-error]").textContent = "Contanos tu nombre así te reservamos el lugar."; $("#f-name").focus(); return; }
      if (!hora) { $("[data-error]").textContent = "Elegí un día y horario disponible."; return; }
      try { localStorage.setItem("mi-nombre", nombre); } catch (err) {}
      const d = addDays(new Date(), +$("#f-day").value), clase = $("#f-class").value;
      const inicio = new Date(d); inicio.setHours(...hora.split(":").map(Number), 0, 0);
      const dur = S.clases.find((c) => c.nombre === clase)?.duracion || 60;
      ultima = { clase: clase === SALA ? "Entrenamiento" : clase, inicio, fin: new Date(inicio.getTime() + dur * 60000) };
      window.open(wa(`Hola! Soy ${nombre} y ${T.mensaje} 💪\n\n${S.clases.length ? `• Clase: ${clase}\n` : ""}• Día: ${DIAS[d.getDay()]} ${fechaCorta(d)}\n• Horario: ${hora}\n• Experiencia: ${$("#f-level").value}`), "_blank", "noopener");
      $("[data-done-text]").textContent = `Te esperamos el ${DIAS[d.getDay()].toLowerCase()} ${fechaCorta(d)} a las ${hora}. Enviá el mensaje de WhatsApp para que te confirmemos el lugar.`;
      $("[data-form-body]").hidden = true;
      $("[data-form-done]").hidden = false;
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-book]");
      if (b) { e.preventDefault(); return abrirReserva(b); }
      if (e.target.closest("[data-invite]")) return invitar();
      const s = e.target.closest("[data-shot]");
      if (s) return N.lightbox(S.galeria, +s.dataset.shot);
    });
    const nav = $("#nav"), dock = $("[data-dock]");
    addEventListener("scroll", () => { nav.classList.toggle("scrolled", scrollY > 24); dock.classList.toggle("show", scrollY > innerHeight * 0.6); }, { passive: true });
    addEventListener("resize", moverPill);
  }

  /* =====================================================================
     RENDER
     ===================================================================== */
  function render(site) {
    timers.forEach(clearInterval); timers = [];
    S = normalizar(site);
    H = N.horarios(S);
    T = Object.assign({}, TEXTOS, S.textos);
    $$("[data-t-boton]").forEach((el) => (el.textContent = T.boton));
    $("[data-t-etiqueta]").textContent = T.etiquetaReserva;
    $("#modal-title").textContent = T.tituloReserva;
    wa = (msg) => `https://wa.me/${S.negocio.whatsapp}?text=${encodeURIComponent(msg)}`;
    N.aplicarTema({ tema: S.tema, estilos: ESTILOS, tipografias: TIPOGRAFIAS, cuerpo: "family=Inter:wght@400;500;600;700", fallback: '"Impact", "Arial Narrow", sans-serif' });
    const n = S.negocio;
    N.seo({ titulo: `${n.nombre} — ${n.eslogan}`, descripcion: n.descripcion, ld: {
      "@context": "https://schema.org", "@type": "ExerciseGym", name: n.nombre, description: n.descripcion, telephone: n.whatsapp ? "+" + n.whatsapp : undefined, address: n.direccion,
      sameAs: n.instagram ? [`https://instagram.com/${n.instagram}`] : undefined, openingHoursSpecification: N.horarioLD(S.horario),
      aggregateRating: S.puntajeGoogle ? { "@type": "AggregateRating", ratingValue: String(S.puntajeGoogle).replace(",", "."), reviewCount: S.cantidadResenas } : undefined } });

    const logo = n.logo ? `<img src="${esc(n.logo)}" alt="${esc(n.nombre)}">` : `${esc(n.nombre)}<b>.</b>`;
    $$("[data-logo]").forEach((el) => (el.innerHTML = logo));
    const html = S.secciones.map((k) => [k, R[k] ? R[k]() : ""]);
    $("[data-navlinks]").innerHTML = html.filter(([k, h]) => NAV[k] && h).slice(0, 6).map(([k]) => `<a href="#${k}">${NAV[k]}</a>`).join("");
    $("[data-main]").innerHTML = html.map(([, h]) => h).join("");
    $("[data-address]").textContent = n.direccion;
    const ig = $("[data-instagram]");
    ig.href = n.instagram ? `https://instagram.com/${n.instagram}` : "#";
    ig.textContent = n.instagram ? "@" + n.instagram : "";
    $("[data-year]").textContent = new Date().getFullYear();
    $$("[data-wa-link]").forEach((el) => { el.href = wa(el.dataset.waLink); el.target = "_blank"; el.rel = "noopener"; });
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.mapa || n.direccion)}`;
    $$("[data-directions]").forEach((el) => (el.href = maps));

    N.aviso($("[data-aviso]"), S.aviso, timers);
    H.pintarEstado($("[data-status]"));
    pintarVivo();
    conectarHorarios();
    conectarAfluencia();
    conectarPlanes();
    conectarRecomendador();
    conectarCoaches();
    conectarCalculadora();
    N.conectarComparadores();
    N.observar();
    timers.push(setInterval(() => { H.pintarEstado($("[data-status]")); pintarVivo(); pintarClases(true); pintarAfluencia(false); }, 60000));
  }

  /* ---------- Planilla de Google ---------- */
  async function cargarPlanilla(base) {
    try {
      const p = await N.leerPlanillas(base.planilla);
      if (!Object.keys(p).length) return;
      const nuevo = JSON.parse(JSON.stringify(base));
      if (p.clases?.length) nuevo.clases = p.clases.map((c) => ({ dia: N.diaDe(c.dia), hora: c.hora, nombre: c.clase || c.nombre, coach: c.coach, duracion: +c.duracion || 60 }));
      if (p.planes?.length) nuevo.planes = p.planes.map((x, i) => ({ id: "p" + i, nombre: x.nombre, precio: N.numero(x.precio), bajada: x.bajada, incluye: x.incluye, destacado: /^s/i.test(x.destacado || ""), linkPago: x.linkpago }));
      if (p.aviso?.length) nuevo.aviso = { texto: p.aviso[0].texto, hasta: p.aviso[0].hasta, link: p.aviso[0].link };
      render(nuevo);
    } catch (e) { console.warn("No se pudo leer la planilla; se usan los datos de config.js.", e); }
  }

  conectarFijos();
  N.vistaPrevia(render);
  render(window.SITE);
  if (!PREVIEW) cargarPlanilla(window.SITE);
})();
