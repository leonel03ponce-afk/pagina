(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PREVIEW = new URLSearchParams(location.search).has("preview");

  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

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
  const SECCIONES_NAV = { horarios: "Horarios", planes: "Planes", coaches: "Coaches", galeria: "El gimnasio", opiniones: "Opiniones", preguntas: "Preguntas", ubicacion: "Ubicación" };

  /* ---------- Utilidades ---------- */
  const toMin = (h) => { const [a, b] = String(h).split(":").map(Number); return a * 60 + (b || 0); };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => String(n).split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const fechaCorta = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
  const etiquetaDia = (d, i) => (i === 0 ? "Hoy" : i === 1 ? "Mañana" : `${DIAS_CORTOS[d.getDay()]} ${fechaCorta(d)}`);
  const icon = {
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    wa: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1 3.6 3.7-1A9.8 9.8 0 1 0 12 2.2zm5.5 12.2c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.9-1.6-3.9-3.4-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>`,
  };

  let S, wa, timers = [], io;

  /* ---------- Normalizar datos (tolera configs incompletas) ---------- */
  function normalizar(site) {
    const s = JSON.parse(JSON.stringify(site || {}));
    s.negocio = Object.assign({ nombre: "Gimnasio", eslogan: "Entrená mejor", descripcion: "", whatsapp: "", direccion: "", mapa: "", instagram: "" }, s.negocio);
    s.tema = Object.assign({ estilo: "neon", acento: "", tipografia: "impacto" }, s.tema);
    s.secciones = Array.isArray(s.secciones) ? s.secciones : ["portada", "horarios", "planes", "ubicacion"];
    s.portada = Object.assign({ etiqueta: "", foto: "", video: "" }, s.portada);
    s.horario = s.horario || {};
    for (const k of ["feriados", "numeros", "programas", "clases", "planes", "coaches", "galeria", "opiniones", "preguntas"]) s[k] = Array.isArray(s[k]) ? s[k] : [];
    s.clases = s.clases.filter((c) => c && c.nombre && c.hora !== undefined).map((c) => ({ ...c, dia: +c.dia, duracion: +c.duracion || 60 }));
    s.planes = s.planes.filter((p) => p && p.nombre).map((p, i) => ({ ...p, id: p.id || "plan" + i, precio: +p.precio || 0, incluye: Array.isArray(p.incluye) ? p.incluye : String(p.incluye || "").split(";").map((x) => x.trim()).filter(Boolean) }));
    s.descuentoTrimestral = +s.descuentoTrimestral || 0;
    s.paseDiario = +s.paseDiario || 0;
    s.planilla = s.planilla || {};
    return s;
  }

  /* ---------- Tema ---------- */
  function hexRgb(h) {
    const m = String(h).replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    const x = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
    return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
  }
  function aplicarTema(t) {
    const est = ESTILOS[t.estilo] || ESTILOS.neon;
    const acento = hexRgb(t.acento) ? t.acento : est.acento;
    const [r, g, b] = hexRgb(acento);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const root = document.documentElement;
    root.dataset.modo = est.modo;
    root.style.setProperty("--accent", acento);
    root.style.setProperty("--accent-ink", lum > 0.55 ? "#0b0b0c" : "#ffffff");
    root.style.setProperty("--accent-soft", `rgba(${r},${g},${b},${est.modo === "claro" ? 0.22 : 0.18})`);
    const tipo = TIPOGRAFIAS[t.tipografia] || TIPOGRAFIAS.impacto;
    root.style.setProperty("--display", `${tipo.familia}, "Impact", "Arial Narrow", sans-serif`);
    const url = `https://fonts.googleapis.com/css2?${tipo.url}&family=Inter:wght@400;500;600;700&display=swap`;
    if ($("#fuentes").href !== url) $("#fuentes").href = url;
    $('meta[name="theme-color"]').content = est.modo === "claro" ? "#f3f2ee" : "#0b0b0c";
  }

  /* ---------- Fechas, feriados y estado ---------- */
  const feriadoDe = (d) => S.feriados.find((f) => f.fecha === iso(d));
  const cerradoEl = (d) => !S.horario[d.getDay()] || !!feriadoDe(d);
  function estado() {
    const hoy = new Date(), m = nowMin(), h = S.horario[hoy.getDay()], fer = feriadoDe(hoy);
    if (!fer && h && m >= toMin(h[0]) && m < toMin(h[1])) return { open: true, txt: "Abierto", sub: `cierra ${h[1]}` };
    for (let i = 0; i < 15; i++) {
      const d = addDays(hoy, i);
      if (cerradoEl(d)) continue;
      const hh = S.horario[d.getDay()];
      if (i === 0 && m >= toMin(hh[0])) continue;
      return { open: false, txt: fer && i > 0 ? "Feriado" : "Cerrado", sub: `abre ${i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[d.getDay()].toLowerCase()} ${hh[0]}` };
    }
    return { open: false, txt: "Cerrado", sub: "" };
  }
  function pintarEstado() {
    const e = estado(), el = $("[data-status]");
    el.classList.toggle("open", e.open);
    el.innerHTML = `<i></i>${e.txt}${e.sub ? ` <span>· ${esc(e.sub)}</span>` : ""}`;
  }
  // Próxima fecha (0 a 6 días) en la que cae un día de la semana
  const proximaFecha = (dow) => addDays(new Date(), (dow - new Date().getDay() + 7) % 7);
  function proximaClase() {
    const hoy = new Date();
    for (let i = 0; i < 14; i++) {
      const d = addDays(hoy, i);
      if (cerradoEl(d)) continue;
      const lista = S.clases.filter((c) => c.dia === d.getDay() && (i > 0 || toMin(c.hora) > nowMin())).sort((a, b) => toMin(a.hora) - toMin(b.hora));
      if (lista.length) {
        const c = lista[0];
        const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : "el " + DIAS[d.getDay()].toLowerCase();
        return `<span class="status open" style="background:transparent;border:0;padding:0"><i></i></span> Próxima clase: <b>${esc(c.nombre)} ${cuando} ${esc(c.hora)}</b>${c.coach ? ` con ${esc(c.coach)}` : ""}`;
      }
    }
    return "";
  }

  /* =====================================================================
     SECCIONES: cada una devuelve su HTML y, si hace falta, se "conecta"
     ===================================================================== */
  const ui = { dia: null, filtro: "Todas", coach: null, periodo: 1, recomendado: null, resp: {} };

  const R = {};

  R.portada = () => {
    const p = S.portada, n = S.negocio;
    const palabras = String(n.eslogan).split(" ");
    const corte = Math.max(1, Math.ceil(palabras.length / 2));
    const l1 = palabras.slice(0, corte).join(" "), resto = palabras.slice(corte);
    const media = p.video ? `<video src="${esc(p.video)}" autoplay muted loop playsinline ${p.foto ? `poster="${esc(p.foto)}"` : ""}></video>`
      : p.foto ? `<img src="${esc(p.foto)}" alt="" onerror="this.remove()">` : "";
    const disciplinas = ["Musculación", ...new Set(S.clases.map((c) => c.nombre))];
    const items = [...disciplinas, ...disciplinas, ...disciplinas, ...disciplinas];
    return `<section class="hero">
      <div class="hero-media">${media}</div>
      <div class="wrap">
        ${p.etiqueta ? `<span class="eyebrow intro">${esc(p.etiqueta)}</span>` : ""}
        <h1><span class="line"><span>${esc(l1)}</span></span>${resto.length ? `<span class="line"><span><em>${esc(resto[0])}</em> ${esc(resto.slice(1).join(" "))}</span></span>` : ""}</h1>
        <div class="hero-bottom">
          <div class="intro d1"><p>${esc(n.descripcion)}</p><p class="next-class" data-next-class></p></div>
          <div class="hero-ctas intro d2">
            <button class="btn btn-primary" data-book>Reservá tu clase gratis ${icon.arrow}</button>
            ${S.secciones.includes("horarios") ? `<a href="#horarios" class="btn btn-ghost">Ver horarios</a>` : S.secciones.includes("planes") ? `<a href="#planes" class="btn btn-ghost">Ver planes</a>` : ""}
          </div>
        </div>
      </div>
    </section>
    <div class="marquee" aria-hidden="true"><div class="marquee-track">${items.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>`;
  };

  R.numeros = () => S.numeros.length ? `<section><div class="wrap"><div class="stats">${S.numeros.map((x, i) =>
    `<div class="stat reveal" style="--d:${i * 60}ms"><strong data-count="${+x.valor || 0}" data-suffix="${esc(x.sufijo || "")}">0</strong><small>${esc(x.texto)}</small></div>`).join("")}</div></div></section>` : "";

  R.programas = () => S.programas.length ? `<section><div class="wrap">
    <div class="head"><h2 class="reveal">Elegí cómo<br><span>entrenar</span></h2><p class="reveal" style="--d:80ms">Distintas formas de entrenar, un mismo objetivo: que te sientas más fuerte cada semana.</p></div>
    <div class="programs">${S.programas.map((p, i) => `
      <article class="program clip" style="--d:${i * 80}ms">
        <div class="ph">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
        <div class="program-body">${p.etiqueta ? `<span class="tag">${esc(p.etiqueta)}</span>` : ""}<h3>${esc(p.nombre)}</h3><p>${esc(p.texto)}</p></div>
      </article>`).join("")}</div></div></section>` : "";

  /* ---------- Horarios ---------- */
  R.horarios = () => S.clases.length ? `<section id="horarios"><div class="wrap">
    <div class="head"><h2 class="reveal">Horarios<br><span>de clases</span></h2>
      <p class="reveal" style="--d:80ms">Elegí el día, filtrá por disciplina y reservá tu lugar en un toque. La sala de musculación está abierta todo el horario.</p></div>
    <div class="tabs" role="tablist" aria-label="Día" data-days></div>
    <div class="chips" data-filters></div>
    <div class="classes" data-classes aria-live="polite"></div>
  </div></section>` : "";

  function diasConClases() { return ORDEN_SEMANA.filter((d) => S.clases.some((c) => c.dia === d)); }
  function pintarDias() {
    const box = $("[data-days]");
    if (!box) return;
    const dias = diasConClases();
    if (ui.dia === null || !dias.includes(ui.dia)) {
      const hoy = new Date().getDay();
      ui.dia = dias.includes(hoy) && !feriadoDe(new Date()) ? hoy : dias.find((d) => !feriadoDe(proximaFecha(d))) ?? dias[0];
    }
    box.innerHTML = dias.map((d) => {
      const f = proximaFecha(d), fer = feriadoDe(f), esHoy = d === new Date().getDay();
      return `<button class="tab${fer ? " holiday" : ""}" role="tab" data-day="${d}" aria-selected="${d === ui.dia}">
        <small>${fer ? "Feriado" : esHoy ? "Hoy" : `${DIAS_CORTOS[d]} ${fechaCorta(f)}`}</small><strong>${DIAS[d]}</strong></button>`;
    }).join("");
  }
  function pintarFiltros() {
    const box = $("[data-filters]");
    if (!box) return;
    const disciplinas = ["Todas", ...new Set(S.clases.map((c) => c.nombre))];
    box.innerHTML = disciplinas.map((f) => `<button class="chip" data-filter="${esc(f)}" aria-pressed="${f === ui.filtro}">${esc(f)}</button>`).join("") +
      (ui.coach ? `<button class="chip coach" data-clear-coach>Con ${esc(ui.coach)} ✕</button>` : "");
  }
  function pintarClases(silencioso) {
    const box = $("[data-classes]");
    if (!box) return;
    box.classList.toggle("quiet", !!silencioso);
    const f = proximaFecha(ui.dia), fer = feriadoDe(f), esHoy = ui.dia === new Date().getDay(), m = nowMin();
    if (fer) { box.innerHTML = `<div class="empty">El ${DIAS[ui.dia].toLowerCase()} ${fechaCorta(f)} el gimnasio está cerrado por ${esc(fer.motivo || "feriado")}.</div>`; return; }
    const lista = S.clases.filter((c) => c.dia === ui.dia && (ui.filtro === "Todas" || c.nombre === ui.filtro) && (!ui.coach || c.coach === ui.coach))
      .sort((a, b) => toMin(a.hora) - toMin(b.hora));
    let proxima = false;
    box.innerHTML = lista.length ? lista.map((c, i) => {
      const ini = toMin(c.hora), fin = ini + c.duracion;
      let badge = "", past = false;
      if (esHoy) {
        if (m >= ini && m < fin) badge = `<span class="badge live">En curso</span>`;
        else if (m >= fin) past = true;
        else if (!proxima) { badge = `<span class="badge next">Próxima</span>`; proxima = true; }
      }
      return `<div class="class${past ? " past" : ""}" style="--d:${Math.min(i, 8) * 40}ms">
        <time>${esc(c.hora)}</time>
        <div><h3>${esc(c.nombre)}${badge}</h3><p>${c.duracion} min${c.coach ? ` · con ${esc(c.coach)}` : ""}</p></div>
        ${past ? "" : `<button class="btn btn-ghost btn-sm" data-book data-clase="${esc(c.nombre)}" data-dia="${c.dia}" data-hora="${esc(c.hora)}">Reservar</button>`}
      </div>`;
    }).join("") : `<div class="empty">No hay clases con ese filtro este día. Probá con otro día o con "Todas".</div>`;
  }
  function conectarHorarios() {
    const days = $("[data-days]");
    if (!days) return;
    pintarDias(); pintarFiltros(); pintarClases();
    days.addEventListener("click", (e) => {
      const b = e.target.closest("[data-day]"); if (!b) return;
      ui.dia = +b.dataset.day;
      $$("[data-day]").forEach((t) => t.setAttribute("aria-selected", t === b));
      pintarClases();
    });
    $("[data-filters]").addEventListener("click", (e) => {
      if (e.target.closest("[data-clear-coach]")) { ui.coach = null; pintarFiltros(); pintarClases(); return; }
      const b = e.target.closest("[data-filter]"); if (!b) return;
      ui.filtro = b.dataset.filter;
      pintarFiltros(); pintarClases();
    });
  }

  /* ---------- Recomendador ---------- */
  R.recomendador = () => S.planes.length >= 2 ? `<section><div class="wrap">
    <div class="head"><h2 class="reveal">¿Qué plan<br><span>te conviene?</span></h2><p class="reveal" style="--d:80ms">Respondé tres preguntas y te decimos cuál es el plan ideal para vos.</p></div>
    <div class="duo reveal">
      <div class="card">
        <div class="q"><p>¿Cuál es tu objetivo?</p><div class="opts" data-q="objetivo">
          <button class="opt" data-v="salud">Moverme y sentirme bien</button><button class="opt" data-v="fuerza">Ganar fuerza y músculo</button><button class="opt" data-v="bajar">Bajar de peso</button></div></div>
        <div class="q"><p>¿Cuántos días por semana podés venir?</p><div class="opts" data-q="dias">
          <button class="opt" data-v="pocos">1 a 3</button><button class="opt" data-v="muchos">4 o más</button></div></div>
        <div class="q"><p>¿Querés que un coach te acompañe de cerca?</p><div class="opts" data-q="coach">
          <button class="opt" data-v="no">No, me arreglo</button><button class="opt" data-v="si">Sí, quiero seguimiento</button></div></div>
      </div>
      <div class="card result"><div class="swap" data-r>
        <span class="kicker">Tu plan ideal</span><h3 data-r-name>—</h3>
        <p class="why" data-r-why>Elegí una opción en cada pregunta y te mostramos el resultado acá.</p>
        <a href="#planes" class="btn btn-primary" data-r-cta hidden>Ver el plan</a>
      </div></div>
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
    if (r.coach === "si") {
      plan = porPrecio[porPrecio.length - 1];
      why = r.objetivo === "bajar" ? "Con un coach encima vas a ver resultados más rápido y sin lesionarte." : "Vas a tener a alguien que te arme cada rutina, te corrija y te empuje a progresar.";
    } else if (r.dias === "muchos" || r.objetivo === "bajar") {
      plan = medio;
      why = r.objetivo === "bajar" ? "Combinar sala con clases grupales es la forma más efectiva de bajar de peso." : "Si venís seguido, te conviene tenerlo todo: sala y clases sin límite.";
    } else {
      plan = porPrecio[0];
      why = "Para entrenar a tu ritmo unas veces por semana, es lo más conveniente.";
    }
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
        <button aria-pressed="${ui.periodo === 1}" data-period="1">Mensual</button><button aria-pressed="${ui.periodo === 3}" data-period="3">Trimestral <em>-${S.descuentoTrimestral}%</em></button></div>` : ""}
    </div>
    <div class="plans" data-plans></div>
    ${S.paseDiario || S.mediosDePago ? `<div class="plan-extra reveal">
      ${S.paseDiario ? `<span>¿Venís de visita o querés probar? <b>Pase diario ${money(S.paseDiario)}</b></span>` : ""}
      ${S.mediosDePago ? `<span>${esc(S.mediosDePago)}</span>` : ""}
    </div>` : ""}
  </div></section>` : "";

  function pintarPlanes() {
    const box = $("[data-plans]");
    if (!box) return;
    const d = S.descuentoTrimestral;
    box.innerHTML = S.planes.map((p, i) => {
      const mensual = ui.periodo === 3 ? p.precio * (1 - d / 100) : p.precio;
      const sub = ui.periodo === 3 ? `${money(mensual * 3)} cada 3 meses · ahorrás ${money((p.precio - mensual) * 3)}` : p.bajada || "";
      const msg = `Hola! Quiero el plan ${p.nombre}${ui.periodo === 3 ? " trimestral" : ""} (${money(mensual)}/mes). ¿Cómo sigo?`;
      const pagar = p.linkPago && ui.periodo === 1
        ? `<a class="btn btn-mp" href="${esc(p.linkPago)}" target="_blank" rel="noopener">Pagar online</a><a class="btn btn-ghost btn-sm" href="${wa(msg)}" target="_blank" rel="noopener">Consultar por WhatsApp</a>`
        : `<a class="btn ${p.destacado ? "btn-primary" : "btn-ghost"}" href="${wa(msg)}" target="_blank" rel="noopener">Quiero el plan ${esc(p.nombre)}</a>`;
      return `<div class="plan reveal in${p.destacado ? " featured" : ""}${ui.recomendado === p.id ? " recommended" : ""}" id="plan-${esc(p.id)}" style="--d:${i * 60}ms">
        ${ui.recomendado === p.id ? `<span class="flag">Recomendado para vos</span>` : p.destacado ? `<span class="flag">Más elegido</span>` : ""}
        <h3>${esc(p.nombre)}</h3>
        <div class="price">${money(mensual)}<small> /mes</small></div>
        <p class="sub">${esc(sub)}</p>
        <ul>${p.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <div class="acts">${pagar}</div>
      </div>`;
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

  /* ---------- Coaches ---------- */
  R.coaches = () => S.coaches.length ? `<section id="coaches"><div class="wrap">
    <div class="head"><h2 class="reveal">Tu equipo<br><span>de coaches</span></h2><p class="reveal" style="--d:80ms">Profesionales que te conocen por tu nombre y te acompañan en cada entrenamiento.</p></div>
    <div class="coaches">${S.coaches.map((c, i) => {
      const tiene = S.clases.some((x) => x.coach === c.nombre);
      return `<article class="coach reveal" style="--d:${i * 60}ms">
        <div class="pic"><span>${esc(initials(c.nombre))}</span>${c.foto ? `<img src="${esc(c.foto)}" alt="${esc(c.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
        <div class="coach-body"><h3>${esc(c.nombre)}</h3><p>${esc(c.especialidad)}</p>
          ${tiene && S.secciones.includes("horarios") ? `<button class="lnk" data-coach="${esc(c.nombre)}">Ver sus clases</button>` : c.instagram ? `<a class="lnk" href="https://instagram.com/${esc(c.instagram)}" target="_blank" rel="noopener">@${esc(c.instagram)}</a>` : ""}
        </div></article>`;
    }).join("")}</div></div></section>` : "";

  function conectarCoaches() {
    $$("[data-coach]").forEach((b) => b.addEventListener("click", () => {
      ui.coach = b.dataset.coach;
      ui.filtro = "Todas";
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

  let lbIndex = 0;
  function lbShow(i) {
    const n = S.galeria.length;
    lbIndex = (i + n) % n;
    const g = S.galeria[lbIndex];
    const img = $("[data-lb-img]");
    img.style.visibility = "visible";
    img.onerror = () => (img.style.visibility = "hidden");
    img.src = g.foto || "";
    img.alt = g.titulo;
    $("[data-lb-cap]").textContent = `${g.titulo} · ${lbIndex + 1}/${n}`;
  }
  function conectarGaleria() {
    $$("[data-shot]").forEach((b) => b.addEventListener("click", () => { lbShow(+b.dataset.shot); $("[data-lightbox]").showModal(); }));
  }

  /* ---------- Calculadora ---------- */
  R.calculadora = () => `<section><div class="wrap">
    <div class="head"><h2 class="reveal">Calculá tus<br><span>calorías</span></h2><p class="reveal" style="--d:80ms">Una estimación de cuánto comer por día según tu objetivo. Para un plan exacto, hablá con un coach.</p></div>
    <div class="duo reveal">
      <div class="card" data-calc>
        <div class="q"><p>Sexo</p><div class="opts" data-c="sexo"><button class="opt" data-v="m" aria-pressed="true">Hombre</button><button class="opt" data-v="f">Mujer</button></div></div>
        <div class="inputs">
          <div class="field"><label for="c-edad">Edad</label><input id="c-edad" type="number" inputmode="numeric" min="14" max="90" value="28"></div>
          <div class="field"><label for="c-peso">Peso (kg)</label><input id="c-peso" type="number" inputmode="decimal" min="35" max="250" value="75"></div>
          <div class="field"><label for="c-alt">Altura (cm)</label><input id="c-alt" type="number" inputmode="numeric" min="120" max="230" value="175"></div>
        </div>
        <div class="field"><label for="c-act">Actividad</label><select id="c-act">
          <option value="1.2">Poca (trabajo sentado, sin ejercicio)</option><option value="1.375">Ligera (1 a 3 entrenamientos)</option>
          <option value="1.55" selected>Moderada (3 a 5 entrenamientos)</option><option value="1.725">Alta (6 o 7 entrenamientos)</option></select></div>
        <div class="q"><p>Objetivo</p><div class="opts" data-c="obj"><button class="opt" data-v="bajar">Bajar grasa</button><button class="opt" data-v="mantener" aria-pressed="true">Mantener</button><button class="opt" data-v="subir">Ganar músculo</button></div></div>
      </div>
      <div class="card result">
        <span class="kicker">Calorías por día</span>
        <div class="kcal" data-kcal>—</div>
        <div class="macros" data-macros></div>
        <a class="btn btn-primary" data-calc-cta target="_blank" rel="noopener">Quiero un plan con coach</a>
      </div>
    </div></div></section>`;

  const calc = { sexo: "m", obj: "mantener" };
  function calcular() {
    const edad = +$("#c-edad").value, peso = +$("#c-peso").value, alt = +$("#c-alt").value, act = +$("#c-act").value;
    if (!(edad > 0 && peso > 0 && alt > 0)) return;
    const bmr = 10 * peso + 6.25 * alt - 5 * edad + (calc.sexo === "m" ? 5 : -161);
    const ajuste = { bajar: 0.8, mantener: 1, subir: 1.12 }[calc.obj];
    const kcal = Math.round((bmr * act * ajuste) / 10) * 10;
    const prot = Math.round(peso * (calc.obj === "mantener" ? 1.6 : 2));
    const grasa = Math.round(peso * 0.9);
    const carbs = Math.max(0, Math.round((kcal - prot * 4 - grasa * 9) / 4));
    $("[data-kcal]").textContent = kcal.toLocaleString("es-AR");
    const tot = prot * 4 + grasa * 9 + carbs * 4 || 1;
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
    <div class="quotes">${S.opiniones.map((o, i) => `<figure class="quote reveal" style="--d:${i * 60}ms">
      <div class="stars" aria-label="${+o.estrellas || 5} estrellas">${"★".repeat(+o.estrellas || 5)}</div>
      <blockquote><p>"${esc(o.texto)}"</p></blockquote>
      <figcaption class="who"><span class="avatar">${esc(initials(o.nombre))}</span>${esc(o.nombre)}</figcaption></figure>`).join("")}</div>
  </div></section>` : "";

  R.preguntas = () => S.preguntas.length ? `<section id="preguntas"><div class="wrap faq">
    <div><h2 class="reveal">Preguntas<br><span>frecuentes</span></h2>
      <p class="reveal" style="--d:80ms;color:var(--muted);margin:18px 0 22px">¿No encontrás lo que buscás? Escribinos y te respondemos al toque.</p>
      <a class="btn btn-wa reveal" style="--d:120ms" href="${wa("Hola! Tengo una consulta")}" target="_blank" rel="noopener">${icon.wa} Preguntar por WhatsApp</a></div>
    <div>${S.preguntas.map((q) => `<details class="reveal"><summary>${esc(q.p)}</summary><p>${esc(q.r)}</p></details>`).join("")}</div>
  </div></section>` : "";

  R.ubicacion = () => {
    const n = S.negocio, hoy = new Date();
    const prox = S.feriados.map((f) => ({ ...f, d: new Date(f.fecha + "T00:00") })).filter((f) => f.d >= addDays(hoy, -1) && f.d <= addDays(hoy, 30)).sort((a, b) => a.d - b.d)[0];
    return `<section id="ubicacion"><div class="wrap">
      <div class="head"><h2 class="reveal">Vení a<br><span>conocernos</span></h2></div>
      <div class="visit">
        <div class="map reveal">${n.mapa ? `<iframe title="Mapa de ${esc(n.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(n.mapa)}&z=15&output=embed"></iframe>` : ""}</div>
        <div class="info reveal" style="--d:80ms">
          <div><h3>Dirección</h3><p>${esc(n.direccion)}</p></div>
          <div><h3>Horario</h3><table class="hours">${ORDEN_SEMANA.map((d) => {
            const h = S.horario[d];
            return `<tr class="${d === hoy.getDay() ? "today" : ""}"><td>${DIAS[d]}</td><td>${h ? `${esc(h[0])} – ${esc(h[1])}` : "Cerrado"}</td></tr>`;
          }).join("")}</table>
          ${prox ? `<p class="note" style="margin-top:10px">Cerrado el ${DIAS[prox.d.getDay()].toLowerCase()} ${fechaCorta(prox.d)} · ${esc(prox.motivo || "feriado")}</p>` : ""}</div>
          <div class="actions"><a class="btn btn-ghost" data-directions target="_blank" rel="noopener">Cómo llegar</a><a class="btn btn-wa" href="${wa("Hola! Quería hacer una consulta")}" target="_blank" rel="noopener">WhatsApp</a></div>
        </div>
      </div></div></section>`;
  };

  R.cierre = () => `<section><div class="wrap"><div class="cta reveal">
    <span class="eyebrow">Sin compromiso</span>
    <h2>Tu primera clase<br><span>corre por nuestra cuenta</span></h2>
    <p>Elegí día y horario, y te esperamos. No necesitás traer nada más que ganas.</p>
    <button class="btn btn-primary" data-book>Reservar clase gratis</button>
  </div></div></section>`;

  /* ---------- Barra de aviso con cuenta regresiva ---------- */
  function pintarAviso() {
    const box = $("[data-aviso]");
    const a = S.aviso;
    box.innerHTML = "";
    if (!a || !a.texto) return;
    const fin = a.hasta ? new Date(a.hasta + "T23:59:59") : null;
    if (fin && fin < new Date()) return;
    const key = "aviso-cerrado:" + a.texto;
    try { if (!PREVIEW && sessionStorage.getItem(key)) return; } catch (e) {}
    box.innerHTML = `<div class="aviso"><div class="wrap">
      ${a.link ? `<a href="${esc(a.link)}">${esc(a.texto)}</a>` : `<span>${esc(a.texto)}</span>`}
      ${fin ? `<span class="count" data-count-down></span>` : ""}
      <button class="cerrar" aria-label="Cerrar aviso" data-aviso-x>✕</button></div></div>`;
    $("[data-aviso-x]").addEventListener("click", () => { box.innerHTML = ""; try { sessionStorage.setItem(key, "1"); } catch (e) {} });
    if (!fin) return;
    const tick = () => {
      const el = $("[data-count-down]");
      if (!el) return;
      let s = Math.max(0, Math.floor((fin - new Date()) / 1000));
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      el.innerHTML = `Termina en ${d ? `<b>${d}d</b>` : ""}<b>${String(h).padStart(2, "0")}h</b><b>${String(m).padStart(2, "0")}m</b><b>${String(s).padStart(2, "0")}s</b>`;
    };
    tick();
    timers.push(setInterval(tick, 1000));
  }

  /* ---------- Reserva de clase gratis ---------- */
  const SALA = "Musculación (sala libre)";
  let ultimaReserva = null;
  function horasPara(clase, d, esHoy) {
    if (cerradoEl(d)) return [];
    const m = nowMin(), dia = d.getDay();
    if (clase === SALA) {
      const h = S.horario[dia], out = [];
      for (let t = toMin(h[0]); t <= toMin(h[1]) - 60; t += 60) if (!esHoy || t > m) out.push(`${String((t / 60) | 0).padStart(2, "0")}:00`);
      return out;
    }
    return S.clases.filter((c) => c.nombre === clase && c.dia === dia && (!esHoy || toMin(c.hora) > m)).map((c) => c.hora).sort((a, b) => toMin(a) - toMin(b));
  }
  function llenarDias(preDia) {
    const fC = $("#f-class"), fD = $("#f-day"), out = [];
    for (let i = 0; i < 10 && out.length < 6; i++) {
      const d = addDays(new Date(), i);
      if (horasPara(fC.value, d, i === 0).length) out.push({ d, i });
    }
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
    llenarDias(btn?.dataset.dia !== undefined ? +btn.dataset.dia : undefined);
    if (btn?.dataset.hora) llenarHoras(btn.dataset.hora);
    $("[data-error]").textContent = "";
    $("[data-form-body]").hidden = false;
    $("[data-form-done]").hidden = true;
    $("[data-modal]").showModal();
    if (matchMedia("(pointer: fine)").matches) $("#f-name").focus();
  }
  function descargarICS() {
    const r = ultimaReserva;
    if (!r) return;
    const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//web//reserva//ES", "BEGIN:VEVENT",
      `UID:${Date.now()}@${S.negocio.nombre.replace(/\W/g, "")}`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(r.inicio)}`, `DTEND:${f(r.fin)}`,
      `SUMMARY:${r.clase} en ${S.negocio.nombre}`, `LOCATION:${S.negocio.direccion.replace(/,/g, "\\,")}`,
      "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Tu clase empieza en 1 hora", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "mi-clase.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function conectarReserva() {
    $("#f-class").addEventListener("change", () => llenarDias());
    $("#f-day").addEventListener("change", () => llenarHoras());
    $("#f-name").addEventListener("input", () => ($("[data-error]").textContent = ""));
    $$("[data-close]").forEach((b) => b.addEventListener("click", () => $("[data-modal]").close()));
    $("[data-modal]").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    $("[data-ics]").addEventListener("click", descargarICS);
    $("[data-form]").addEventListener("submit", (e) => {
      e.preventDefault();
      const nombre = $("#f-name").value.trim(), hora = $("#f-time").value;
      if (!nombre) { $("[data-error]").textContent = "Contanos tu nombre así te reservamos el lugar."; $("#f-name").focus(); return; }
      if (!hora) { $("[data-error]").textContent = "Elegí un día y horario disponible."; return; }
      const d = addDays(new Date(), +$("#f-day").value);
      const clase = $("#f-class").value;
      const inicio = new Date(d); inicio.setHours(...hora.split(":").map(Number), 0, 0);
      const dur = S.clases.find((c) => c.nombre === clase)?.duracion || 60;
      ultimaReserva = { clase: clase === SALA ? "Entrenamiento" : clase, inicio, fin: new Date(inicio.getTime() + dur * 60000) };
      const msg = `Hola! Soy ${nombre} y quiero reservar mi clase gratis 💪\n\n• Clase: ${clase}\n• Día: ${DIAS[d.getDay()]} ${fechaCorta(d)}\n• Horario: ${hora}\n• Experiencia: ${$("#f-level").value}`;
      window.open(wa(msg), "_blank", "noopener");
      $("[data-done-text]").textContent = `Te esperamos el ${DIAS[d.getDay()].toLowerCase()} ${fechaCorta(d)} a las ${hora}. Enviá el mensaje de WhatsApp para que te confirmemos el lugar.`;
      $("[data-form-body]").hidden = true;
      $("[data-form-done]").hidden = false;
    });
    // Galería (lightbox)
    const lb = $("[data-lightbox]");
    $$("[data-lb]").forEach((b) => b.addEventListener("click", () => lbShow(lbIndex + +b.dataset.lb)));
    $("[data-lb-close]").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") lbShow(lbIndex + 1); if (e.key === "ArrowLeft") lbShow(lbIndex - 1); });
    let x0 = null;
    const fig = $("figure", lb);
    fig.addEventListener("pointerdown", (e) => (x0 = e.clientX));
    fig.addEventListener("pointerup", (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) lbShow(lbIndex + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    // Botones de reserva en cualquier parte
    document.addEventListener("click", (e) => { const b = e.target.closest("[data-book]"); if (b) { e.preventDefault(); abrirReserva(b); } });
  }

  /* ---------- Animaciones ---------- */
  function countUp(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    const fmt = (n) => n.toLocaleString("es-AR") + suf;
    if (reduce || PREVIEW) return (el.textContent = fmt(end));
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => { const t = Math.min((now - t0) / dur, 1); el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - t, 4)))); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  function observar() {
    io?.disconnect();
    if (PREVIEW) { $$("[data-count]").forEach(countUp); return; }
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -80px 0px" });
    $$(".reveal:not(.in), .clip").forEach((el) => io.observe(el));
  }

  /* ---------- SEO local ---------- */
  function seo() {
    const n = S.negocio;
    document.title = `${n.nombre} — ${n.eslogan}`;
    $('meta[name="description"]').content = n.descripcion;
    let s = $("#ld");
    if (!s) { s = document.createElement("script"); s.id = "ld"; s.type = "application/ld+json"; document.head.appendChild(s); }
    s.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "ExerciseGym", name: n.nombre, description: n.descripcion,
      telephone: n.whatsapp ? "+" + n.whatsapp : undefined, address: n.direccion,
      sameAs: n.instagram ? [`https://instagram.com/${n.instagram}`] : undefined,
      aggregateRating: S.puntajeGoogle ? { "@type": "AggregateRating", ratingValue: String(S.puntajeGoogle).replace(",", "."), reviewCount: S.cantidadResenas } : undefined,
      openingHoursSpecification: Object.entries(S.horario).filter(([, h]) => h).map(([d, h]) => ({
        "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d], opens: h[0], closes: h[1] })),
    });
  }

  /* =====================================================================
     RENDER PRINCIPAL
     ===================================================================== */
  function render(site) {
    timers.forEach(clearInterval); timers = [];
    S = normalizar(site);
    wa = (msg) => `https://wa.me/${S.negocio.whatsapp}?text=${encodeURIComponent(msg)}`;
    aplicarTema(S.tema);
    seo();

    const n = S.negocio;
    const logo = n.logo ? `<img src="${esc(n.logo)}" alt="${esc(n.nombre)}">` : `${esc(n.nombre)}<b>.</b>`;
    $$("[data-logo]").forEach((el) => (el.innerHTML = logo));
    $("[data-navlinks]").innerHTML = S.secciones.filter((k) => SECCIONES_NAV[k] && (R[k]?.() || "")).slice(0, 5)
      .map((k) => `<a href="#${k}">${SECCIONES_NAV[k]}</a>`).join("");
    $("[data-main]").innerHTML = S.secciones.map((k) => (R[k] ? R[k]() : "")).join("");
    $("[data-address]").textContent = n.direccion;
    const ig = $("[data-instagram]");
    ig.href = n.instagram ? `https://instagram.com/${n.instagram}` : "#";
    ig.textContent = n.instagram ? "@" + n.instagram : "";
    $("[data-year]").textContent = new Date().getFullYear();
    $$("[data-wa-link]").forEach((el) => { el.href = wa(el.dataset.waLink); el.target = "_blank"; el.rel = "noopener"; });
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.mapa || n.direccion)}`;
    $$("[data-directions]").forEach((el) => (el.href = maps));

    pintarAviso();
    pintarEstado();
    const nc = $("[data-next-class]");
    if (nc) nc.innerHTML = proximaClase();
    conectarHorarios();
    conectarPlanes();
    conectarRecomendador();
    conectarCoaches();
    conectarGaleria();
    conectarCalculadora();
    observar();

    timers.push(setInterval(() => {
      pintarEstado();
      const el = $("[data-next-class]");
      if (el) el.innerHTML = proximaClase();
      pintarClases(true);
    }, 60000));
  }

  /* ---------- Planilla de Google (datos en vivo) ---------- */
  function parseCSV(txt) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (q) { if (c === '"' && txt[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
      else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && txt[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const [head, ...data] = rows.filter((r) => r.some((x) => x.trim()));
    if (!head) return [];
    const keys = head.map((h) => h.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""));
    return data.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
  }
  const DIA_TXT = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };
  const diaDe = (v) => { const t = String(v).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").slice(0, 3); return t in DIA_TXT ? DIA_TXT[t] : +v; };
  async function cargarPlanilla(base) {
    const p = base.planilla || {};
    const pedir = async (url) => (url ? parseCSV(await (await fetch(url, { cache: "no-store" })).text()) : null);
    try {
      const [clases, planes, aviso] = await Promise.all([pedir(p.clases), pedir(p.planes), pedir(p.aviso)]);
      if (!clases && !planes && !aviso) return;
      const nuevo = JSON.parse(JSON.stringify(base));
      if (clases?.length) nuevo.clases = clases.map((c) => ({ dia: diaDe(c.dia), hora: c.hora, nombre: c.clase || c.nombre, coach: c.coach, duracion: +c.duracion || 60 }));
      if (planes?.length) nuevo.planes = planes.map((x, i) => ({ id: "p" + i, nombre: x.nombre, precio: +String(x.precio).replace(/[^\d]/g, ""), bajada: x.bajada, incluye: x.incluye, destacado: /^s/i.test(x.destacado || ""), linkPago: x.linkpago }));
      if (aviso?.length) nuevo.aviso = { texto: aviso[0].texto, hasta: aviso[0].hasta, link: aviso[0].link };
      render(nuevo);
    } catch (e) {
      console.warn("No se pudo leer la planilla, se usan los datos de config.js", e);
    }
  }

  /* ---------- Arranque ---------- */
  const nav = $("#nav"), dock = $("[data-dock]");
  addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", scrollY > 24);
    dock.classList.toggle("show", scrollY > innerHeight * 0.6);
  }, { passive: true });
  addEventListener("resize", moverPill);
  conectarReserva();

  if (PREVIEW) {
    document.body.classList.add("preview");
    addEventListener("message", (e) => { if (e.data?.type === "site") render(e.data.site); });
    parent.postMessage({ type: "preview-ready" }, "*");
  }
  render(window.SITE);
  if (!PREVIEW) cargarPlanilla(window.SITE);
})();
