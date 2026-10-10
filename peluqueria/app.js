(() => {
  const N = window.Nucleo;
  const { $, $$, esc, money, initials, durTxt, toMin, toHora, nowMin, iso, deIso, addDays, mismoDia, fechaCorta, nombreDia, sinTildes, DIAS, DIAS_CORTOS, ICON, reduce, PREVIEW } = N;

  const ESTILOS = {
    crema: { acento: "#a8824a", modo: "claro" },
    noche: { acento: "#d4b483", modo: "oscuro" },
    rosa: { acento: "#c46b78", modo: "claro" },
    salvia: { acento: "#5f7f63", modo: "claro" },
    minimal: { acento: "#1a1a1a", modo: "claro" },
  };
  const TIPOGRAFIAS = {
    elegante: { familia: '"Cormorant Garamond"', url: "family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400" },
    clasica: { familia: '"Playfair Display"', url: "family=Playfair+Display:ital,wght@0,400;0,500;1,400" },
    moderna: { familia: '"DM Serif Display"', url: "family=DM+Serif+Display:ital@0;1" },
  };
  const NAV = { servicios: "Servicios", turnos: "Turnos", combos: "Combos", trabajos: "Trabajos", equipo: "Equipo", regalo: "Gift card", ubicacion: "Ubicación" };

  let S, H, wa, timers = [];
  const st = { svcs: new Set(), largo: null, pro: "any", prefPro: null, date: null, slot: null, cat: "Todos", q: "", monto: null };
  let ultimo = null;

  /* ---------- Datos ---------- */
  const slug = (s) => sinTildes(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  function normalizar(site) {
    const s = JSON.parse(JSON.stringify(site || {}));
    s.negocio = Object.assign({ nombre: "Peluquería", rubro: "", eslogan: "", descripcion: "", whatsapp: "", direccion: "", mapa: "", instagram: "" }, s.negocio);
    s.tema = Object.assign({ estilo: "crema", acento: "", tipografia: "elegante" }, s.tema);
    s.secciones = Array.isArray(s.secciones) ? s.secciones : ["portada", "servicios", "turnos", "ubicacion"];
    s.portada = Object.assign({ etiqueta: "", foto: "" }, s.portada);
    s.horario = s.horario || {};
    s.turnos = Object.assign({ intervalo: 30, diasParaReservar: 21, anticipacionMinima: 90, sena: 0, linkSena: "" }, s.turnos);
    for (const k of ["feriados", "largos", "servicios", "combos", "equipo", "ocupados", "trabajos", "galeria", "giftCards", "opiniones", "preguntas"]) s[k] = Array.isArray(s[k]) ? s[k] : [];
    s.servicios = s.servicios.filter((x) => x && x.nombre).map((x) => ({ ...x, id: x.id || slug(x.nombre), precio: +x.precio || 0, duracion: +x.duracion || 30, categoria: x.categoria || "Servicios" }));
    s.equipo = s.equipo.filter((p) => p && p.nombre).map((p) => ({ ...p, categorias: Array.isArray(p.categorias) ? p.categorias : [], dias: (Array.isArray(p.dias) ? p.dias : []).map(Number) }));
    s.combos = s.combos.filter((c) => c && Array.isArray(c.servicios) && c.servicios.length > 1);
    s.descuentoPrimeraVez = +s.descuentoPrimeraVez || 0;
    return s;
  }

  /* ---------- Cálculos de la reserva ---------- */
  const svcById = (id) => S.servicios.find((x) => x.id === id);
  const elegidos = () => S.servicios.filter((x) => st.svcs.has(x.id));
  const duracion = () => elegidos().reduce((a, x) => a + x.duracion, 0);
  const necesitaLargo = () => S.largos.length > 0 && elegidos().some((x) => x.porLargo);
  const redondear = (n) => Math.round(n / 100) * 100;
  const precioDe = (x) => (x.porLargo && st.largo !== null && S.largos[st.largo] ? redondear(x.precio * (+S.largos[st.largo].factor || 1)) : x.precio);
  const categorias = () => [...new Set(elegidos().map((x) => x.categoria))];
  const puedeHacer = (p) => !p.categorias.length || categorias().every((c) => p.categorias.includes(c));
  const trabaja = (p, d) => !p.dias.length || p.dias.includes(d.getDay());
  function comboAplicado() {
    let mejor = null;
    for (const c of S.combos) {
      if (!c.servicios.every((id) => st.svcs.has(id))) continue;
      const ahorro = c.servicios.map(svcById).filter(Boolean).reduce((a, x) => a + precioDe(x), 0) * (+c.descuento || 0) / 100;
      if (!mejor || ahorro > mejor.ahorro) mejor = { ...c, ahorro: redondear(ahorro) };
    }
    return mejor;
  }
  function totales() {
    const sub = elegidos().reduce((a, x) => a + precioDe(x), 0);
    const combo = comboAplicado();
    const tras = sub - (combo?.ahorro || 0);
    const primera = $("#b-first")?.checked && S.descuentoPrimeraVez > 0 ? redondear(tras * S.descuentoPrimeraVez / 100) : 0;
    return { sub, combo, primera, total: tras - primera };
  }

  /* ---------- Disponibilidad ---------- */
  const fechaNorm = (f) => { const m = String(f).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/); return m ? `${m[3].length === 2 ? "20" + m[3] : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : String(f); };
  const esDe = (o, p) => { const q = sinTildes(o.profesional || "").trim(); return !q || q === "todos" || q === "salon" || sinTildes(p.nombre).startsWith(q); };
  function ocupadosDe(d) {
    const f = iso(d);
    return S.ocupados.filter((o) => fechaNorm(o.fecha) === f && o.hora).map((o) => ({ ...o, ini: toMin(o.hora), fin: toMin(o.hora) + (+o.duracion || 60) }));
  }
  function libres(d, t, dur, ocup) {
    const pisa = (o) => t < o.fin && t + dur > o.ini;
    if (!S.equipo.length) return ocup.some(pisa) ? [] : [{ nombre: "" }];
    const cands = typeof st.pro === "number" ? [S.equipo[st.pro]] : S.equipo.filter(puedeHacer);
    return cands.filter((p) => p && trabaja(p, d) && !ocup.some((o) => pisa(o) && esDe(o, p)));
  }
  function slotsDe(d, dur = duracion() || S.turnos.intervalo) {
    if (!d || H.cerradoEl(d)) return [];
    const [a, b] = S.horario[d.getDay()];
    const minimo = mismoDia(d, new Date()) ? nowMin() + +S.turnos.anticipacionMinima : -1;
    const ocup = ocupadosDe(d), out = [];
    for (let t = toMin(a); t + dur <= toMin(b); t += +S.turnos.intervalo || 30) if (t >= minimo && libres(d, t, dur, ocup).length) out.push(toHora(t));
    return out;
  }
  function proximoLibre() {
    const dur = Math.min(...S.servicios.map((x) => x.duracion), 60);
    const guard = { svcs: st.svcs, pro: st.pro };
    st.svcs = new Set(); st.pro = "any";
    let res = null;
    for (let i = 0; i < 14 && !res; i++) { const d = addDays(new Date(), i); const s = slotsDe(d, dur); if (s.length) res = { d, h: s[0], i }; }
    Object.assign(st, guard);
    return res;
  }

  /* =====================================================================
     SECCIONES
     ===================================================================== */
  const R = {};
  const titulo = (txt) => esc(txt).replace(/\*(.+?)\*/g, "<em>$1</em>");

  R.portada = () => {
    const n = S.negocio, p = S.portada;
    const lineas = String(n.eslogan || n.nombre).split("|");
    return `<section class="hero"><div class="wrap">
      <div>
        <span class="kicker intro">${esc(p.etiqueta || [n.rubro, n.desde ? `desde ${n.desde}` : ""].filter(Boolean).join(" · "))}</span>
        <h1>${lineas.map((l) => `<span class="line"><span>${titulo(l.trim())}</span></span>`).join("")}</h1>
        <p class="lead intro d1">${esc(n.descripcion)}</p>
        <div class="hero-ctas intro d2">
          ${S.secciones.includes("turnos") ? `<a href="#turnos" class="btn btn-dark">Reservá tu turno online</a>` : `<a class="btn btn-dark" href="${wa("Hola! Quiero pedir un turno")}" target="_blank" rel="noopener">Pedí tu turno</a>`}
          ${S.secciones.includes("servicios") ? `<a href="#servicios" class="btn btn-line">Ver precios</a>` : ""}
        </div>
        <div class="proof intro d3">${S.puntajeGoogle ? `<b>${esc(S.puntajeGoogle)}</b><div><span class="stars">★★★★★</span><br>${esc(S.cantidadResenas)} reseñas en Google</div>` : ""}</div>
        <p class="next-free intro d3" data-next-free></p>
      </div>
      <div class="hero-visual">
        <div class="arch">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(n.nombre)}" onerror="this.remove()">` : ""}</div>
        <div class="seal" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><path id="c" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>
          <text font-size="8.5" fill="currentColor" font-family="Manrope, sans-serif"><textPath href="#c" textLength="234" lengthAdjust="spacing">${esc((n.rubro || "Peluquería").toUpperCase())} · TURNOS ONLINE ·</textPath></text></svg>
          <b>${esc(initials(n.nombre))}</b></div>
      </div>
    </div></section>`;
  };
  function pintarProximoLibre() {
    const el = $("[data-next-free]");
    if (!el) return;
    if (!S.secciones.includes("turnos")) { el.innerHTML = ""; return; }
    const p = proximoLibre();
    el.innerHTML = p ? `<span class="dot"></span>Próximo turno libre: <b>${p.i === 0 ? "hoy" : p.i === 1 ? "mañana" : DIAS[p.d.getDay()].toLowerCase() + " " + fechaCorta(p.d)} a las ${p.h}</b>` : "";
  }

  /* ---------- Menú de servicios con buscador ---------- */
  R.servicios = () => S.servicios.length ? `<section id="servicios"><div class="wrap">
    <div class="head"><div><span class="kicker reveal">Servicios y precios</span><h2 class="reveal" style="--d:60ms">Cada detalle,<br><em>a tu medida</em></h2></div>
      <p class="reveal" style="--d:120ms">Tocá "Reservar" y te llevamos directo a elegir día y horario.${S.largos.length ? " Los precios marcados \"desde\" varían según el largo." : ""}</p></div>
    <div class="menu-bar"><div class="cats" data-cats></div>
      <label class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input type="search" placeholder="Buscar servicio…" aria-label="Buscar servicio" data-search value="${esc(st.q)}"></label></div>
    <div class="menu" data-menu aria-live="polite"></div>
  </div></section>` : "";

  function pintarMenu() {
    const box = $("[data-menu]");
    if (!box) return;
    const cats = ["Todos", ...new Set(S.servicios.map((x) => x.categoria))];
    if (!cats.includes(st.cat)) st.cat = "Todos";
    $("[data-cats]").innerHTML = cats.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === st.cat}">${esc(c)}</button>`).join("");
    const q = sinTildes(st.q.trim());
    const lista = S.servicios.filter((x) => (st.cat === "Todos" || x.categoria === st.cat) && (!q || sinTildes(x.nombre + " " + x.detalle + " " + x.categoria).includes(q)));
    box.innerHTML = lista.length ? lista.map((x, i) => `<div class="svc" style="--d:${Math.min(i, 8) * 35}ms">
      <h3>${esc(x.nombre)}</h3><span class="price">${x.porLargo && S.largos.length ? "<small>desde</small>" : ""}${money(x.precio)}</span>
      <p>${esc(x.detalle)}</p><div class="meta"><span class="dur">${durTxt(x.duracion)}</span>${S.secciones.includes("turnos") ? `<a href="#turnos" class="link" data-reservar="${esc(x.id)}">Reservar</a>` : ""}</div>
    </div>`).join("") : `<div class="empty" style="grid-column:1/-1">No encontramos "${esc(st.q)}". Probá con otra palabra o escribinos.</div>`;
  }
  function conectarMenu() {
    if (!$("[data-menu]")) return;
    pintarMenu();
    $("[data-cats]").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; st.cat = b.dataset.cat; pintarMenu(); });
    $("[data-search]").addEventListener("input", (e) => { st.q = e.target.value; pintarMenu(); });
  }

  /* ---------- Turnos ---------- */
  R.turnos = () => S.servicios.length ? `<section id="turnos" class="band"><div class="wrap">
    <div class="head"><div><span class="kicker reveal">Turnos online</span><h2 class="reveal" style="--d:60ms">Reservá en<br><em>un minuto</em></h2></div>
      <p class="reveal" style="--d:120ms">Solo te mostramos los horarios que de verdad están libres. Te confirmamos por WhatsApp.</p></div>
    <div class="book">
      <div>
        <div class="step" data-step="1"><div class="step-head"><b>1</b><h3>¿Qué te querés hacer?</h3><small>Podés elegir varios</small></div>
          <div class="pick" data-pick-svc></div><div data-largo></div></div>
        <div class="step locked" data-step="2"><div class="step-head"><b>2</b><h3>¿Con quién?</h3></div><div class="pick" data-pick-pro></div></div>
        <div class="step locked" data-step="3"><div class="step-head"><b>3</b><h3>Elegí el día</h3></div><div class="days" data-pick-day></div></div>
        <div class="step locked" data-step="4"><div class="step-head"><b>4</b><h3>Elegí el horario</h3><small data-dur-hint></small></div><div data-pick-slot></div></div>
        <div class="step locked" data-step="5"><div class="step-head"><b>5</b><h3>Tus datos</h3></div>
          <div class="field"><label for="b-name">Nombre y apellido</label><input id="b-name" autocomplete="name" placeholder="Ej: Florencia Méndez"></div>
          <div class="field"><label for="b-note">¿Algo que debamos saber? (opcional)</label><textarea id="b-note" placeholder="Ej: quiero un tono más frío, tengo el pelo muy abundante…"></textarea></div>
          ${S.descuentoPrimeraVez ? `<label class="check"><input type="checkbox" id="b-first"> Es mi primera vez (${S.descuentoPrimeraVez}% de descuento)</label>` : ""}
        </div>
      </div>
      <aside class="summary" aria-live="polite"><h3>Tu turno</h3><div class="sum-list" data-sum></div>
        <div class="total"><div><small>Total estimado</small><br><small data-sum-dur></small></div><strong data-sum-total>$0</strong></div>
        <button class="btn btn-wa btn-block" data-send disabled>${ICON.wa} Pedir turno por WhatsApp</button><p class="missing" data-missing></p></aside>
    </div></div></section>` : "";

  function pintarServiciosPick() {
    $("[data-pick-svc]").innerHTML = S.servicios.map((x) => `<button data-svc="${esc(x.id)}" aria-pressed="${st.svcs.has(x.id)}">
      <strong>${esc(x.nombre)}</strong><span>${x.porLargo && S.largos.length ? "desde " : ""}${money(precioDe(x))} · ${durTxt(x.duracion)}</span></button>`).join("");
    $("[data-largo]").innerHTML = necesitaLargo() ? `<div class="sub-q"><p>¿Qué largo tenés? <span class="hint">(cambia el precio)</span></p><div class="opts">${S.largos.map((l, i) =>
      `<button class="opt" data-largo-i="${i}" aria-pressed="${st.largo === i}">${esc(l.nombre)}</button>`).join("")}</div></div>` : "";
  }
  function pintarPros() {
    const box = $("[data-pick-pro]");
    if (!S.equipo.length) { box.innerHTML = `<p class="hint">Te atiende el equipo del salón.</p>`; return; }
    const cats = categorias();
    box.innerHTML = `<button data-pro="any" aria-pressed="${st.pro === "any"}"><strong>Sin preferencia</strong><span>El primer horario libre del equipo</span></button>` +
      S.equipo.map((p, i) => {
        const ok = puedeHacer(p), falta = cats.filter((c) => !p.categorias.includes(c)).join(", ").toLowerCase();
        const dias = p.dias.length ? p.dias.slice().sort((a, b) => (a || 7) - (b || 7)).map((d) => DIAS_CORTOS[d]).join(", ") : "";
        return `<button data-pro="${i}" aria-pressed="${st.pro === i}" ${ok ? "" : "disabled"}><strong>${esc(p.nombre)}</strong>
          <span>${ok ? esc(dias ? `${p.rol ? p.rol.split("·").pop().trim() + " · " : ""}${dias}` : p.rol) : `No realiza ${esc(falta)}`}</span></button>`;
      }).join("");
  }
  function pintarDias() {
    let html = "";
    for (let i = 0; i < +S.turnos.diasParaReservar; i++) {
      const d = addDays(new Date(), i), n = slotsDe(d).length;
      const fer = H.feriadoDe(d);
      html += `<button class="day" data-date="${iso(d)}" aria-pressed="${mismoDia(d, st.date)}" ${n ? "" : "disabled"} aria-label="${nombreDia(d)}${n ? "" : fer ? " (feriado)" : " (sin turnos)"}">
        <small>${i === 0 ? "Hoy" : i === 1 ? "Mañ" : DIAS_CORTOS[d.getDay()]}</small><strong>${d.getDate()}</strong>${n && n <= 3 ? `<em>Últimos</em>` : ""}</button>`;
    }
    $("[data-pick-day]").innerHTML = html;
  }
  function pintarSlots() {
    const box = $("[data-pick-slot]");
    $("[data-dur-hint]").textContent = st.svcs.size ? `Duración aprox. ${durTxt(duracion())}` : "";
    if (!st.date) { box.innerHTML = `<p class="hint">Primero elegí un día.</p>`; return; }
    const slots = slotsDe(st.date);
    if (!slots.length) { box.innerHTML = `<p class="hint">No quedan horarios este día para ${durTxt(duracion())} de servicio. Probá con otro día${typeof st.pro === "number" ? " u otra profesional" : ""}.</p>`; return; }
    const g = [["Mañana", slots.filter((h) => toMin(h) < 780)], ["Tarde", slots.filter((h) => toMin(h) >= 780)]].filter((x) => x[1].length);
    box.innerHTML = g.map(([t, hs]) => `<div class="slots-group"><p>${t}</p><div class="slots">${hs.map((h) => `<button class="slot" data-slot="${h}" aria-pressed="${st.slot === h}">${h}</button>`).join("")}</div></div>`).join("");
  }
  function faltantes() {
    const f = [];
    if (!st.svcs.size) f.push("un servicio");
    if (necesitaLargo() && st.largo === null) f.push("tu largo de pelo");
    if (!st.date) f.push("el día");
    if (!st.slot) f.push("el horario");
    if (!$("#b-name")?.value.trim()) f.push("tu nombre");
    return f;
  }
  function pintarResumen() {
    if (!$("[data-sum]")) return;
    const ss = elegidos(), t = totales();
    const pro = st.pro === "any" ? "Sin preferencia" : S.equipo[st.pro]?.nombre;
    $("[data-sum]").innerHTML = ss.length ? [
      ...ss.map((x) => `<div class="sum-row"><span>${esc(x.nombre)}</span><span>${money(precioDe(x))}</span></div>`),
      st.largo !== null && necesitaLargo() ? `<div class="sum-row"><span>Largo</span><span>${esc(S.largos[st.largo].nombre)}</span></div>` : "",
      S.equipo.length ? `<div class="sum-row"><span>Profesional</span><span>${esc(pro)}</span></div>` : "",
      st.date ? `<div class="sum-row"><span>Día</span><span>${nombreDia(st.date)}</span></div>` : "",
      st.slot ? `<div class="sum-row"><span>Horario</span><span>${st.slot} a ${toHora(toMin(st.slot) + duracion())}</span></div>` : "",
      t.combo ? `<div class="sum-row disc"><span>Combo ${esc(t.combo.nombre)}</span><span>−${money(t.combo.ahorro)}</span></div>` : "",
      t.primera ? `<div class="sum-row disc"><span>Primera vez</span><span>−${money(t.primera)}</span></div>` : "",
    ].join("") : `<p class="hint" style="color:inherit;opacity:.65">Todavía no elegiste ningún servicio.</p>`;
    const el = $("[data-sum-total]"), nuevo = money(t.total);
    if (el.textContent !== nuevo) { el.textContent = nuevo; if (!reduce) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); } }
    $("[data-sum-dur]").textContent = ss.length ? `Duración aprox. ${durTxt(duracion())}` : "";
    const f = faltantes();
    $("[data-send]").disabled = f.length > 0;
    $("[data-missing]").textContent = f.length ? `Falta: ${f.join(", ")}.` : "Te confirmamos por WhatsApp en minutos.";
  }
  function pintarReserva() {
    if (!$("[data-pick-svc]")) return;
    const pro = typeof st.pro === "number" ? S.equipo[st.pro] : null;
    if (st.pro !== "any" && (!pro || !puedeHacer(pro))) st.pro = "any";
    if (st.prefPro !== null && S.equipo[st.prefPro] && puedeHacer(S.equipo[st.prefPro])) st.pro = st.prefPro;
    if (st.date && !slotsDe(st.date).length) st.date = null;
    if (st.slot && !slotsDe(st.date).includes(st.slot)) st.slot = null;
    pintarServiciosPick(); pintarPros(); pintarDias(); pintarSlots();
    const okSvc = st.svcs.size > 0 && (!necesitaLargo() || st.largo !== null);
    const abiertos = [true, okSvc, okSvc, okSvc && !!st.date, okSvc && !!st.slot];
    const hechos = [okSvc, okSvc, !!st.date, !!st.slot, !!$("#b-name").value.trim()];
    $$("[data-step]").forEach((el, i) => { el.classList.toggle("locked", !abiertos[i]); el.classList.toggle("done", abiertos[i] && hechos[i]); });
    pintarResumen();
  }
  function conectarReserva() {
    if (!$("[data-pick-svc]")) return;
    try { $("#b-name").value = localStorage.getItem("mi-nombre") || ""; } catch (e) {}
    pintarReserva();
    $("[data-step='1']").addEventListener("click", (e) => {
      const b = e.target.closest("[data-svc]"), l = e.target.closest("[data-largo-i]");
      if (b) { const id = b.dataset.svc; st.svcs.has(id) ? st.svcs.delete(id) : st.svcs.add(id); }
      else if (l) st.largo = +l.dataset.largoI;
      else return;
      pintarReserva();
    });
    $("[data-pick-pro]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-pro]"); if (!b || b.disabled) return;
      st.pro = b.dataset.pro === "any" ? "any" : +b.dataset.pro;
      st.prefPro = st.pro === "any" ? null : st.pro;
      pintarReserva();
    });
    $("[data-pick-day]").addEventListener("click", (e) => { const b = e.target.closest("[data-date]"); if (!b || b.disabled) return; st.date = deIso(b.dataset.date); pintarReserva(); });
    $("[data-pick-slot]").addEventListener("click", (e) => { const b = e.target.closest("[data-slot]"); if (!b) return; st.slot = b.dataset.slot; pintarReserva(); });
    $("#b-name").addEventListener("input", () => { pintarResumen(); $("[data-step='5']").classList.toggle("done", !!$("#b-name").value.trim()); });
    $("#b-first")?.addEventListener("change", pintarResumen);
    $("[data-send]").addEventListener("click", enviarTurno);
  }
  function enviarTurno() {
    if (faltantes().length) return;
    const ss = elegidos(), t = totales(), nombre = $("#b-name").value.trim(), nota = $("#b-note").value.trim();
    try { localStorage.setItem("mi-nombre", nombre); } catch (e) {}
    let pro = st.pro === "any" ? "Sin preferencia" : S.equipo[st.pro].nombre;
    if (st.pro === "any" && S.equipo.length) {
      const l = libres(st.date, toMin(st.slot), duracion(), ocupadosDe(st.date));
      if (l[0]?.nombre) pro += ` (libre: ${l[0].nombre})`;
    }
    const msg = [`Hola! Quiero pedir un turno ✨`, ``,
      `• Nombre: ${nombre}`, `• Servicio: ${ss.map((x) => x.nombre).join(" + ")}`,
      st.largo !== null && necesitaLargo() ? `• Largo: ${S.largos[st.largo].nombre}` : "",
      S.equipo.length ? `• Profesional: ${pro}` : "",
      `• Día: ${nombreDia(st.date)}`, `• Horario: ${st.slot} (aprox. ${durTxt(duracion())})`,
      `• Total estimado: ${money(t.total)}${t.combo ? ` (combo ${t.combo.nombre})` : ""}${t.primera ? ` (con ${S.descuentoPrimeraVez}% primera vez)` : ""}`,
      nota ? `• Nota: ${nota}` : ""].filter((l, i) => l || i === 1).join("\n");
    window.open(wa(msg), "_blank", "noopener");
    const inicio = new Date(st.date); inicio.setHours(...st.slot.split(":").map(Number), 0, 0);
    ultimo = { titulo: `${ss.map((x) => x.nombre).join(" + ")} en ${S.negocio.nombre}`, inicio, fin: new Date(inicio.getTime() + duracion() * 60000) };
    $("[data-done-text]").textContent = `Pediste turno para el ${DIAS[st.date.getDay()].toLowerCase()} ${fechaCorta(st.date)} a las ${st.slot}. Enviá el mensaje de WhatsApp y te confirmamos en minutos.`;
    const sena = +S.turnos.sena, link = S.turnos.linkSena, bs = $("[data-sena]");
    bs.hidden = !(sena > 0 && link);
    if (!bs.hidden) { bs.href = link; bs.textContent = `Pagar seña de ${money(redondear(t.total * sena / 100))}`; }
    $("[data-done-modal]").showModal();
  }

  /* ---------- Combos ---------- */
  R.combos = () => {
    const lista = S.combos.map((c) => ({ ...c, items: c.servicios.map(svcById).filter(Boolean) })).filter((c) => c.items.length > 1);
    if (!lista.length) return "";
    return `<section id="combos"><div class="wrap">
      <div class="head"><div><span class="kicker reveal">Combos</span><h2 class="reveal" style="--d:60ms">Más servicios,<br><em>mejor precio</em></h2></div>
        <p class="reveal" style="--d:120ms">El descuento se aplica solo cuando reservás todos los servicios del combo.</p></div>
      <div class="combos">${lista.map((c, i) => {
        const normal = c.items.reduce((a, x) => a + x.precio, 0), conDesc = redondear(normal * (1 - (+c.descuento || 0) / 100));
        return `<article class="combo reveal" style="--d:${i * 70}ms"><span class="off">-${+c.descuento || 0}%</span><h3>${esc(c.nombre)}</h3><p>${esc(c.texto || "")}</p>
          <ul>${c.items.map((x) => `<li>${esc(x.nombre)}</li>`).join("")}</ul>
          <div class="prices"><strong>${money(conDesc)}</strong><s>${money(normal)}</s></div>
          ${S.secciones.includes("turnos") ? `<a href="#turnos" class="btn btn-dark" data-combo="${i}">Reservar combo</a>` : ""}</article>`;
      }).join("")}</div></div></section>`;
  };

  /* ---------- Trabajos ---------- */
  R.trabajos = () => S.trabajos.length || S.galeria.length ? `<section id="trabajos"><div class="wrap">
    <div class="head"><div><span class="kicker reveal">Trabajos</span><h2 class="reveal" style="--d:60ms">Resultados que<br><em>hablan solos</em></h2></div>
      <p class="reveal" style="--d:120ms">${S.trabajos.length ? "Deslizá para ver el antes y el después. " : ""}Tocá una foto para verla en grande.</p></div>
    ${S.trabajos.length ? `<div class="works">${S.trabajos.map((t, i) => `<figure class="reveal" style="--d:${i * 80}ms">${N.comparador(t)}<figcaption>${esc(t.titulo)}</figcaption></figure>`).join("")}</div>` : ""}
    ${S.galeria.length ? `<div class="gallery">${S.galeria.map((g, i) => `<button class="shot clip" style="--d:${i * 70}ms" data-shot="${i}" aria-label="Ver ${esc(g.titulo)}">
      ${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.titulo)}" loading="lazy" onerror="this.remove()">` : ""}<span>${esc(g.titulo)}</span></button>`).join("")}</div>` : ""}
  </div></section>` : "";

  /* ---------- Equipo ---------- */
  R.equipo = () => S.equipo.length ? `<section id="equipo"><div class="wrap">
    <div class="head"><div><span class="kicker reveal">Equipo</span><h2 class="reveal" style="--d:60ms">Manos que<br><em>escuchan</em></h2></div></div>
    <div class="team">${S.equipo.map((p, i) => {
      const dias = p.dias.length ? p.dias.slice().sort((a, b) => (a || 7) - (b || 7)).map((d) => DIAS_CORTOS[d]).join(" · ") : "";
      return `<div class="member reveal" style="--d:${i * 80}ms">
        <div class="photo"><span>${esc(initials(p.nombre))}</span>${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
        <h3>${esc(p.nombre)}</h3><p>${esc(p.rol)}</p>${dias ? `<p class="days-txt">Atiende: ${dias}</p>` : ""}
        ${S.secciones.includes("turnos") ? `<a href="#turnos" class="link" data-pro-book="${i}">Reservar con ${esc(p.nombre.split(" ")[0])}</a>` : ""}</div>`;
    }).join("")}</div></div></section>` : "";

  /* ---------- Fidelidad ---------- */
  R.fidelidad = () => {
    const f = S.fidelidad;
    if (!f || !+f.visitas) return "";
    const n = Math.min(12, +f.visitas);
    return `<section id="fidelidad"><div class="wrap loyal">
      <div class="stamp-card reveal"><div class="top"><span class="serif">${esc(S.negocio.nombre)}</span><span class="kicker" style="color:inherit;opacity:.7">Tarjeta de clienta</span></div>
        <div class="stamps">${Array.from({ length: n }, (_, i) => i === n - 1 ? `<div class="stamp gift"><span>${esc(f.premio || "Premio")}</span></div>` : `<div class="stamp${i < 3 ? " on" : ""}" style="--d:${300 + i * 120}ms">${i < 3 ? "✓" : i + 1}</div>`).join("")}</div></div>
      <div><span class="kicker reveal">Beneficios</span><h2 class="reveal" style="--d:60ms;margin-top:14px">Volver tiene<br><em>premio</em></h2>
        <p class="reveal" style="--d:120ms">${esc(f.texto || "")}</p>
        ${S.secciones.includes("turnos") ? `<a href="#turnos" class="btn btn-dark reveal" style="--d:160ms">Sumar mi próxima visita</a>` : ""}</div>
    </div></section>`;
  };

  /* ---------- Gift card ---------- */
  R.regalo = () => S.giftCards.length ? `<section id="regalo"><div class="wrap gift">
    <div class="reveal"><div class="gcard"><div class="top"><span class="brand">${esc(S.negocio.nombre)}</span><span class="to">Gift card</span></div>
      <div class="amt" data-card-amt></div><div><p class="msg" data-card-msg></p><p class="to" data-card-to></p></div></div></div>
    <div><span class="kicker reveal">Gift card</span><h2 class="reveal" style="--d:60ms;margin-top:14px">Regalá un<br><em>momento</em></h2>
      <div class="opts amounts reveal" style="--d:100ms" data-amounts></div>
      <div class="row2 reveal" style="--d:140ms"><div class="field"><label for="g-to">Para</label><input id="g-to" placeholder="Nombre"></div><div class="field"><label for="g-from">De</label><input id="g-from" placeholder="Tu nombre"></div></div>
      <div class="field reveal" style="--d:160ms"><label for="g-msg">Dedicatoria (opcional)</label><input id="g-msg" maxlength="60" placeholder="¡Feliz cumple! Te merecés un mimo"></div>
      <button class="btn btn-dark reveal" style="--d:180ms" data-gift-send>Pedir gift card por WhatsApp</button></div>
  </div></section>` : "";

  function conectarRegalo() {
    if (!$("[data-amounts]")) return;
    if (!S.giftCards.includes(st.monto)) st.monto = S.giftCards[1] ?? S.giftCards[0];
    const pintar = () => {
      $("[data-amounts]").innerHTML = S.giftCards.map((m) => `<button class="opt" data-amount="${+m}" aria-pressed="${+m === +st.monto}">${money(m)}</button>`).join("");
      $("[data-card-amt]").textContent = money(st.monto);
      const para = $("#g-to").value.trim(), de = $("#g-from").value.trim();
      $("[data-card-msg]").textContent = $("#g-msg").value.trim() || "Un momento solo para vos.";
      $("[data-card-to]").textContent = [para && `Para ${para}`, de && `de ${de}`].filter(Boolean).join(" · ") || "Para alguien especial";
    };
    pintar();
    $("[data-amounts]").addEventListener("click", (e) => { const b = e.target.closest("[data-amount]"); if (!b) return; st.monto = +b.dataset.amount; pintar(); });
    ["#g-to", "#g-from", "#g-msg"].forEach((s) => $(s).addEventListener("input", pintar));
    $("[data-gift-send]").addEventListener("click", () => {
      const para = $("#g-to").value.trim(), de = $("#g-from").value.trim(), m = $("#g-msg").value.trim();
      window.open(wa([`Hola! Quiero comprar una gift card 🎁`, ``, `• Monto: ${money(st.monto)}`, para && `• Para: ${para}`, de && `• De: ${de}`, m && `• Dedicatoria: "${m}"`].filter((l, i) => l || i === 1).join("\n")), "_blank", "noopener");
    });
  }

  /* ---------- Opiniones, preguntas, ubicación, cierre ---------- */
  R.opiniones = () => S.opiniones.length ? `<section id="opiniones"><div class="wrap">
    <div class="head"><div><span class="kicker reveal">${S.puntajeGoogle ? `★★★★★ · ${esc(S.puntajeGoogle)} en Google` : "Opiniones"}</span><h2 class="reveal" style="--d:60ms">Lo que dicen<br><em>nuestras clientas</em></h2></div>
      ${S.linkResenas ? `<a class="btn btn-line btn-sm reveal" href="${esc(S.linkResenas)}" target="_blank" rel="noopener">Dejanos tu reseña</a>` : ""}</div>
    <div class="quotes">${S.opiniones.map((o, i) => `<figure class="quote reveal" style="--d:${i * 60}ms"><div class="stars">★★★★★</div><blockquote><p>"${esc(o.texto)}"</p></blockquote><figcaption>${esc(o.nombre)}</figcaption></figure>`).join("")}</div>
  </div></section>` : "";
  R.preguntas = () => S.preguntas.length ? `<section id="preguntas"><div class="wrap faq">
    <div><span class="kicker reveal">Preguntas frecuentes</span><h2 class="reveal" style="--d:60ms;margin-top:14px">Antes de<br><em>venir</em></h2>
      <a class="btn btn-line reveal" style="--d:120ms;margin-top:24px" href="${wa("Hola! Tengo una consulta")}" target="_blank" rel="noopener">Hacer otra consulta</a></div>
    <div>${S.preguntas.map((q) => `<details class="qa reveal"><summary>${esc(q.p)}</summary><p>${esc(q.r)}</p></details>`).join("")}</div>
  </div></section>` : "";
  R.ubicacion = () => {
    const n = S.negocio, prox = H.proximoFeriado();
    return `<section id="ubicacion"><div class="wrap"><div class="head"><div><span class="kicker reveal">Visitanos</span><h2 class="reveal" style="--d:60ms">Te esperamos<br><em>con un café</em></h2></div></div>
      <div class="visit">
        <div class="map reveal">${n.mapa ? `<iframe title="Mapa de ${esc(n.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(n.mapa)}&z=15&output=embed"></iframe>` : ""}</div>
        <div class="info reveal" style="--d:80ms"><div><h3>Dirección</h3><p>${esc(n.direccion)}</p></div>
          <div><h3>Horarios</h3>${H.tablaHoras()}${prox ? `<p class="warn">Cerrado el ${DIAS[prox.d.getDay()].toLowerCase()} ${fechaCorta(prox.d)} · ${esc(prox.motivo || "feriado")}</p>` : ""}</div>
          <div class="actions"><a class="btn btn-line" data-directions target="_blank" rel="noopener">Cómo llegar</a><a class="btn btn-wa" href="${wa("Hola! Quería hacer una consulta")}" target="_blank" rel="noopener">WhatsApp</a></div></div>
      </div></div></section>`;
  };

  /* ---------- Clics globales ---------- */
  function conectarFijos() {
    $$("[data-icon]").forEach((el) => (el.innerHTML = ICON[el.dataset.icon]));
    $("[data-ics]").addEventListener("click", () => ultimo && N.descargarICS({ ...ultimo, lugar: S.negocio.direccion, archivo: "mi-turno.ics" }));
    $("[data-done-close]").addEventListener("click", () => $("[data-done-modal]").close());
    $("[data-done-modal]").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
    document.addEventListener("click", (e) => {
      const r = e.target.closest("[data-reservar]");
      if (r) { st.svcs.add(r.dataset.reservar); pintarReserva(); return; }
      const c = e.target.closest("[data-combo]");
      if (c) { const combo = S.combos.filter((x) => x.servicios.map(svcById).filter(Boolean).length > 1)[+c.dataset.combo]; st.svcs = new Set(combo.servicios.filter(svcById)); pintarReserva(); return; }
      const p = e.target.closest("[data-pro-book]");
      if (p) { st.prefPro = +p.dataset.proBook; st.pro = puedeHacer(S.equipo[st.prefPro]) ? st.prefPro : "any"; pintarReserva(); return; }
      const s = e.target.closest("[data-shot]");
      if (s) N.lightbox(S.galeria, +s.dataset.shot);
    });
    const nav = $("#nav"), dock = $("[data-dock]");
    addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", scrollY > 24);
      const t = $("#turnos")?.getBoundingClientRect();
      dock.classList.toggle("show", scrollY > innerHeight * 0.6 && !(t && t.top < innerHeight && t.bottom > 0));
    }, { passive: true });
  }

  /* =====================================================================
     RENDER
     ===================================================================== */
  function render(site) {
    timers.forEach(clearInterval); timers = [];
    S = normalizar(site);
    H = N.horarios(S);
    wa = (msg) => `https://wa.me/${S.negocio.whatsapp}?text=${encodeURIComponent(msg)}`;
    for (const id of [...st.svcs]) if (!svcById(id)) st.svcs.delete(id);
    if (st.largo !== null && !S.largos[st.largo]) st.largo = null;
    N.aplicarTema({ tema: S.tema, estilos: ESTILOS, tipografias: TIPOGRAFIAS, cuerpo: "family=Manrope:wght@400;500;600;700", fallback: '"Times New Roman", serif' });
    const n = S.negocio;
    N.seo({ titulo: `${n.nombre} — ${n.rubro || "Peluquería"} · Turnos online`, descripcion: n.descripcion, ld: {
      "@context": "https://schema.org", "@type": "HairSalon", name: n.nombre, description: n.descripcion, telephone: n.whatsapp ? "+" + n.whatsapp : undefined, address: n.direccion,
      sameAs: n.instagram ? [`https://instagram.com/${n.instagram}`] : undefined, openingHoursSpecification: N.horarioLD(S.horario),
      aggregateRating: S.puntajeGoogle ? { "@type": "AggregateRating", ratingValue: String(S.puntajeGoogle).replace(",", "."), reviewCount: S.cantidadResenas } : undefined,
      makesOffer: S.servicios.map((x) => ({ "@type": "Offer", name: x.nombre, price: x.precio, priceCurrency: "ARS" })) } });

    const [p1, ...pr] = n.nombre.split(" ");
    const logo = n.logo ? `<img src="${esc(n.logo)}" alt="${esc(n.nombre)}">` : `${esc(p1)}${pr.length ? ` <em>${esc(pr.join(" "))}</em>` : ""}`;
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
    $$("[data-directions]").forEach((el) => (el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n.mapa || n.direccion)}`));
    const hasTurnos = !!$("#turnos");
    $$('a[href="#turnos"]').forEach((a) => { if (!hasTurnos) { a.href = wa("Hola! Quiero pedir un turno"); a.target = "_blank"; } });

    N.aviso($("[data-aviso]"), S.aviso, timers);
    H.pintarEstado($("[data-status]"));
    pintarProximoLibre();
    conectarMenu();
    conectarReserva();
    conectarRegalo();
    N.conectarComparadores();
    N.observar();
    timers.push(setInterval(() => { H.pintarEstado($("[data-status]")); pintarProximoLibre(); if ($("[data-pick-day]")) { pintarDias(); pintarSlots(); } }, 60000));
  }

  /* ---------- Planilla de Google ---------- */
  async function cargarPlanilla(base) {
    try {
      const p = await N.leerPlanillas(base.planilla);
      if (!Object.keys(p).length) return;
      const nuevo = JSON.parse(JSON.stringify(base));
      if (p.servicios?.length) nuevo.servicios = p.servicios.map((x) => ({ id: x.id || slug(x.nombre), categoria: x.categoria, nombre: x.nombre, precio: N.numero(x.precio), duracion: +x.duracion || 30, detalle: x.detalle, porLargo: /^s/i.test(x.porlargo || "") }));
      if (p.ocupados) nuevo.ocupados = p.ocupados.map((o) => ({ fecha: o.fecha, hora: o.hora, duracion: +o.duracion || 60, profesional: o.profesional }));
      if (p.aviso?.length) nuevo.aviso = { texto: p.aviso[0].texto, hasta: p.aviso[0].hasta, link: p.aviso[0].link };
      render(nuevo);
    } catch (e) { console.warn("No se pudo leer la planilla; se usan los datos de config.js.", e); }
  }

  conectarFijos();
  N.vistaPrevia(render);
  render(window.SITE);
  if (!PREVIEW) cargarPlanilla(window.SITE);
})();
