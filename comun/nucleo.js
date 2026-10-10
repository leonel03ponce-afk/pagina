/* =====================================================================
   NÚCLEO COMPARTIDO
   Utilidades que usan todas las plantillas (gimnasio, peluquería, ...):
   tema, fechas, estado abierto/cerrado, barra de promo, planilla de Google,
   calendario, galería, antes/después y animaciones.
   ===================================================================== */
window.Nucleo = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PREVIEW = new URLSearchParams(location.search).has("preview");

  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

  /* ---------- Texto y números ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(+n || 0).toLocaleString("es-AR");
  const initials = (n) => String(n || "").split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const durTxt = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`);

  /* ---------- Fechas y horas ---------- */
  const toMin = (h) => { const [a, b] = String(h).split(":").map(Number); return a * 60 + (b || 0); };
  const toHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const deIso = (s) => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const mismoDia = (a, b) => !!a && !!b && iso(a) === iso(b);
  const fechaCorta = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
  const nombreDia = (d) => `${DIAS[d.getDay()]} ${fechaCorta(d)}`;
  const etiquetaDia = (d, i) => (i === 0 ? "Hoy" : i === 1 ? "Mañana" : `${DIAS_CORTOS[d.getDay()]} ${fechaCorta(d)}`);
  const DIA_TXT = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };
  const sinTildes = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const diaDe = (v) => { const t = sinTildes(v).slice(0, 3); return t in DIA_TXT ? DIA_TXT[t] : +v; };

  /* ---------- Horario, feriados y estado ---------- */
  function horarios(S) {
    const feriadoDe = (d) => (S.feriados || []).find((f) => f.fecha === iso(d));
    const cerradoEl = (d) => !S.horario[d.getDay()] || !!feriadoDe(d);
    function estado() {
      const hoy = new Date(), m = nowMin(), h = S.horario[hoy.getDay()], fer = feriadoDe(hoy);
      if (!fer && h && m >= toMin(h[0]) && m < toMin(h[1])) return { open: true, txt: "Abierto", sub: `cierra ${h[1]}` };
      for (let i = 0; i < 21; i++) {
        const d = addDays(hoy, i);
        if (cerradoEl(d)) continue;
        const hh = S.horario[d.getDay()];
        if (i === 0 && m >= toMin(hh[0])) continue;
        return { open: false, txt: fer ? "Feriado" : "Cerrado", sub: `abre ${i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[d.getDay()].toLowerCase()} ${hh[0]}` };
      }
      return { open: false, txt: "Cerrado", sub: "" };
    }
    function pintarEstado(el) {
      if (!el) return;
      const e = estado();
      el.classList.toggle("open", e.open);
      el.innerHTML = `<i></i>${e.txt}${e.sub ? ` <span>· ${esc(e.sub)}</span>` : ""}`;
    }
    function tablaHoras() {
      const hoy = new Date();
      return `<table class="hours">${ORDEN_SEMANA.map((d) => {
        const h = S.horario[d];
        return `<tr class="${d === hoy.getDay() ? "today" : ""}"><td>${DIAS[d]}</td><td>${h ? `${esc(h[0])} – ${esc(h[1])}` : "Cerrado"}</td></tr>`;
      }).join("")}</table>`;
    }
    function proximoFeriado(dias = 30) {
      const hoy = new Date();
      return (S.feriados || []).map((f) => ({ ...f, d: deIso(f.fecha) })).filter((f) => f.d >= addDays(hoy, -1) && f.d <= addDays(hoy, dias)).sort((a, b) => a.d - b.d)[0];
    }
    return { feriadoDe, cerradoEl, estado, pintarEstado, tablaHoras, proximoFeriado };
  }

  /* ---------- Tema (colores y tipografía) ---------- */
  function hexRgb(h) {
    const m = String(h || "").replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    const x = m[1].length === 3 ? m[1].split("").map((c) => c + c).join("") : m[1];
    return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16));
  }
  function aplicarTema({ tema, estilos, tipografias, cuerpo, fallback }) {
    const claves = Object.keys(estilos);
    const est = estilos[tema.estilo] || estilos[claves[0]];
    const acento = hexRgb(tema.acento) ? tema.acento : est.acento;
    const [r, g, b] = hexRgb(acento);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const root = document.documentElement;
    root.dataset.modo = est.modo;
    root.dataset.estilo = tema.estilo in estilos ? tema.estilo : claves[0];
    root.style.setProperty("--accent", acento);
    root.style.setProperty("--accent-ink", lum > 0.55 ? "#0b0b0c" : "#ffffff");
    root.style.setProperty("--accent-soft", `rgba(${r},${g},${b},${est.modo === "claro" ? 0.2 : 0.18})`);
    const tipo = tipografias[tema.tipografia] || Object.values(tipografias)[0];
    root.style.setProperty("--display", `${tipo.familia}, ${fallback}`);
    const link = $("#fuentes");
    const url = `https://fonts.googleapis.com/css2?${tipo.url}&${cuerpo}&display=swap`;
    if (link && link.href !== url) link.href = url;
    const tc = $('meta[name="theme-color"]');
    if (tc) tc.content = getComputedStyle(root).getPropertyValue("--bg").trim() || "#000";
  }

  /* ---------- Barra de promoción con cuenta regresiva ---------- */
  function aviso(box, a, timers) {
    box.innerHTML = "";
    if (!a || !a.texto) return;
    const fin = a.hasta ? new Date(deIso(a.hasta).setHours(23, 59, 59)) : null;
    if (fin && fin < new Date()) return;
    const key = "aviso-cerrado:" + a.texto;
    try { if (!PREVIEW && sessionStorage.getItem(key)) return; } catch (e) {}
    box.innerHTML = `<div class="aviso"><div class="wrap">
      ${a.link ? `<a href="${esc(a.link)}">${esc(a.texto)}</a>` : `<span>${esc(a.texto)}</span>`}
      ${fin ? `<span class="count" data-count-down></span>` : ""}
      <button class="cerrar" aria-label="Cerrar aviso" data-aviso-x>✕</button></div></div>`;
    $("[data-aviso-x]", box).addEventListener("click", () => { box.innerHTML = ""; try { sessionStorage.setItem(key, "1"); } catch (e) {} });
    if (!fin) return;
    const tick = () => {
      const el = $("[data-count-down]", box);
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

  /* ---------- Planilla de Google (CSV publicado) ---------- */
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
    const keys = head.map((h) => sinTildes(h.trim()).replace(/\s+/g, ""));
    return data.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
  }
  const numero = (v) => +String(v ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".") || 0;
  async function leerPlanillas(urls) {
    const out = {};
    await Promise.all(Object.entries(urls || {}).filter(([, u]) => u).map(async ([k, u]) => {
      const r = await fetch(u, { cache: "no-store" });
      if (!r.ok) throw new Error(`${k}: ${r.status}`);
      out[k] = parseCSV(await r.text());
    }));
    return out;
  }

  /* ---------- Calendario (.ics) ---------- */
  function descargarICS({ titulo, inicio, fin, lugar, descripcion, archivo = "turno.ics" }) {
    const f = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
    const limpio = (s) => String(s || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//web//reserva//ES", "BEGIN:VEVENT",
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@web`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(inicio)}`, `DTEND:${f(fin)}`,
      `SUMMARY:${limpio(titulo)}`, `LOCATION:${limpio(lugar)}`, descripcion ? `DESCRIPTION:${limpio(descripcion)}` : "",
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${limpio(titulo)} en 2 horas`, "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = archivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Compartir ---------- */
  async function compartir({ titulo, texto, url, wa }) {
    if (navigator.share) {
      try { await navigator.share({ title: titulo, text: texto, url }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(texto + (url ? " " + url : ""))}`, "_blank", "noopener");
  }

  /* ---------- Galería en grande ---------- */
  let lb, lbItems = [], lbI = 0;
  function lightbox(items, i) {
    if (!lb) {
      lb = document.createElement("dialog");
      lb.className = "lightbox";
      lb.setAttribute("aria-label", "Galería");
      lb.innerHTML = `<figure><img alt=""><button class="lb-nav lb-prev" data-d="-1" aria-label="Anterior">‹</button>
        <button class="lb-nav lb-next" data-d="1" aria-label="Siguiente">›</button><button class="lb-close" aria-label="Cerrar">✕</button></figure><figcaption></figcaption>`;
      document.body.appendChild(lb);
      $$(".lb-nav", lb).forEach((b) => b.addEventListener("click", () => show(lbI + +b.dataset.d)));
      $(".lb-close", lb).addEventListener("click", () => lb.close());
      lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
      lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") show(lbI + 1); if (e.key === "ArrowLeft") show(lbI - 1); });
      let x0 = null;
      const fig = $("figure", lb);
      fig.addEventListener("pointerdown", (e) => (x0 = e.clientX));
      fig.addEventListener("pointerup", (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) show(lbI + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    }
    function show(n) {
      lbI = (n + lbItems.length) % lbItems.length;
      const it = lbItems[lbI], img = $("img", lb);
      img.style.visibility = "visible";
      img.onerror = () => (img.style.visibility = "hidden");
      img.src = it.foto || "";
      img.alt = it.titulo || "";
      $("figcaption", lb).textContent = `${it.titulo || ""} · ${lbI + 1}/${lbItems.length}`;
    }
    lbItems = items;
    show(i);
    lb.showModal();
  }

  /* ---------- Antes / después ---------- */
  const comparador = (it) => `<div class="compare" data-compare>
      <div class="cmp-a">${it.antes ? `<img src="${esc(it.antes)}" alt="Antes" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="cmp-b">${it.despues ? `<img src="${esc(it.despues)}" alt="Después" loading="lazy" onerror="this.remove()">` : ""}</div>
      <span class="lbl l">Antes</span><span class="lbl r">Después</span><div class="handle"></div>
      <input type="range" min="0" max="100" value="50" aria-label="Comparar antes y después">
    </div>`;
  function conectarComparadores(root = document) {
    $$("[data-compare]", root).forEach((c) => {
      const inp = $("input", c);
      inp.addEventListener("input", () => c.style.setProperty("--pos", inp.value + "%"));
    });
  }

  /* ---------- Animaciones al hacer scroll ---------- */
  let io;
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
    $$(".reveal:not(.in), .clip:not(.in)").forEach((el) => io.observe(el));
  }

  /* ---------- SEO local ---------- */
  function seo({ titulo, descripcion, ld }) {
    document.title = titulo;
    const md = $('meta[name="description"]');
    if (md) md.content = descripcion || "";
    let s = $("#ld");
    if (!s) { s = document.createElement("script"); s.id = "ld"; s.type = "application/ld+json"; document.head.appendChild(s); }
    s.textContent = JSON.stringify(ld);
  }
  const horarioLD = (horario) => Object.entries(horario).filter(([, h]) => h).map(([d, h]) => ({
    "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d], opens: h[0], closes: h[1] }));

  /* ---------- Modo vista previa (editor) ---------- */
  function vistaPrevia(render) {
    if (!PREVIEW) return false;
    document.body.classList.add("preview");
    addEventListener("message", (e) => { if (e.data?.type === "site") render(e.data.site); });
    parent.postMessage({ type: "preview-ready" }, "*");
    return true;
  }

  const ICON = {
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    wa: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1 3.6 3.7-1A9.8 9.8 0 1 0 12 2.2zm5.5 12.2c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1-1.7-.8-2.9-1.6-3.9-3.4-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>`,
  };

  return {
    $, $$, reduce, PREVIEW, DIAS, DIAS_CORTOS, ORDEN_SEMANA,
    esc, money, initials, durTxt, toMin, toHora, nowMin, iso, deIso, addDays, mismoDia, fechaCorta, nombreDia, etiquetaDia, diaDe, sinTildes, numero,
    horarios, hexRgb, aplicarTema, aviso, parseCSV, leerPlanillas, descargarICS, compartir, lightbox, comparador, conectarComparadores,
    countUp, observar, seo, horarioLD, vistaPrevia, ICON,
  };
})();
