(() => {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

  const toMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const wa = (msg) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const initials = (n) => n.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const fechaCorta = (d) => `${DIAS_CORTOS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  const etiquetaDia = (d, offset) => (offset === 0 ? "Hoy" : offset === 1 ? "Mañana" : fechaCorta(d));

  /* ---------- Contenido básico ---------- */
  document.title = `${S.nombre} — Gimnasio, clases grupales y entrenamiento personal`;
  $$("[data-logo]").forEach((el) => (el.innerHTML = `${esc(S.nombre)}<b>.</b>`));
  $("[data-desc]").textContent = S.descripcion;
  const palabras = S.eslogan.split(" ");
  const corte = Math.ceil(palabras.length / 2);
  $("[data-hero-title]").innerHTML =
    `<span class="line"><span>${esc(palabras.slice(0, corte).join(" "))}</span></span>` +
    `<span class="line"><span><em>${esc(palabras[corte] || "")}</em> ${esc(palabras.slice(corte + 1).join(" "))}</span></span>`;
  if (S.fotoPortada) $("[data-hero-img]").src = S.fotoPortada;
  else $("[data-hero-img]").remove();
  $$("[data-address]").forEach((el) => (el.textContent = S.direccion));
  $$("[data-wa-link]").forEach((el) => { el.href = wa(el.dataset.waLink); el.target = "_blank"; el.rel = "noopener"; });
  const ig = $("[data-instagram]");
  ig.href = `https://instagram.com/${S.instagram}`;
  ig.textContent = "@" + S.instagram;
  $("[data-year]").textContent = new Date().getFullYear();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.mapa)}`;
  $$("[data-directions]").forEach((el) => (el.href = mapsUrl));
  $("[data-map]").innerHTML = `<iframe title="Mapa de ${esc(S.nombre)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    src="https://maps.google.com/maps?q=${encodeURIComponent(S.mapa)}&z=15&output=embed"></iframe>`;

  /* ---------- Abierto / cerrado ---------- */
  function estado() {
    const d = new Date();
    const hoy = S.horario[d.getDay()];
    const m = nowMin();
    if (hoy && m >= toMin(hoy[0]) && m < toMin(hoy[1])) return { open: true, txt: "Abierto", sub: `cierra ${hoy[1]}` };
    for (let i = 0; i < 8; i++) {
      const dia = (d.getDay() + i) % 7;
      const h = S.horario[dia];
      if (!h) continue;
      if (i === 0 && m >= toMin(h[0])) continue;
      const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[dia].toLowerCase();
      return { open: false, txt: "Cerrado", sub: `abre ${cuando} ${h[0]}` };
    }
    return { open: false, txt: "Cerrado", sub: "" };
  }
  function pintarEstado() {
    const e = estado();
    const el = $("[data-status]");
    el.classList.toggle("open", e.open);
    el.innerHTML = `<i></i>${e.txt} <span>· ${e.sub}</span>`;
  }

  // Próxima clase (en la portada)
  function proximaClase() {
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      const dia = (d.getDay() + i) % 7;
      const lista = S.clases.filter((c) => c.dia === dia && (i > 0 || toMin(c.hora) > nowMin())).sort((a, b) => toMin(a.hora) - toMin(b.hora));
      if (lista.length) {
        const c = lista[0];
        const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : "el " + DIAS[dia].toLowerCase();
        return `Próxima clase: <b>${esc(c.nombre)} ${cuando} ${c.hora}</b> con ${esc(c.coach)}`;
      }
    }
    return "";
  }

  /* ---------- Marquee, números y programas ---------- */
  const disciplinas = [...new Set(S.clases.map((c) => c.nombre))];
  const items = ["Musculación", ...disciplinas];
  $("[data-marquee]").innerHTML = [...items, ...items, ...items, ...items].map((t) => `<span>${esc(t)}</span>`).join("");

  $("[data-stats]").innerHTML = S.numeros.map((n, i) =>
    `<div class="stat reveal" style="--d:${i * 60}ms"><strong data-count="${n.valor}" data-suffix="${esc(n.sufijo)}">0</strong><small>${esc(n.texto)}</small></div>`).join("");

  $("[data-programs]").innerHTML = S.programas.map((p, i) => `
    <article class="program clip" style="--d:${i * 80}ms">
      <div class="ph">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="program-body"><span class="tag">${esc(p.etiqueta)}</span><h3>${esc(p.nombre)}</h3><p>${esc(p.texto)}</p></div>
    </article>`).join("");

  /* ---------- Horarios interactivos ---------- */
  let diaSel = new Date().getDay();
  if (!S.clases.some((c) => c.dia === diaSel)) diaSel = ORDEN_SEMANA.find((d) => S.clases.some((c) => c.dia === d));
  let filtro = "Todas";

  const diasConClases = ORDEN_SEMANA.filter((d) => S.clases.some((c) => c.dia === d));
  $("[data-days]").innerHTML = diasConClases.map((d) => {
    const esHoy = d === new Date().getDay();
    return `<button class="tab" role="tab" data-day="${d}" aria-selected="${d === diaSel}">
      <small>${esHoy ? "Hoy" : DIAS_CORTOS[d]}</small><strong>${DIAS[d]}</strong></button>`;
  }).join("");
  $("[data-filters]").innerHTML = ["Todas", ...disciplinas].map((f) =>
    `<button class="chip" data-filter="${esc(f)}" aria-pressed="${f === filtro}">${esc(f)}</button>`).join("");

  function pintarClases(silencioso) {
    $("[data-classes]").classList.toggle("quiet", !!silencioso);
    const esHoy = diaSel === new Date().getDay();
    const m = nowMin();
    const lista = S.clases.filter((c) => c.dia === diaSel && (filtro === "Todas" || c.nombre === filtro)).sort((a, b) => toMin(a.hora) - toMin(b.hora));
    let marcadaProxima = false;
    $("[data-classes]").innerHTML = lista.length ? lista.map((c, i) => {
      const ini = toMin(c.hora), fin = ini + c.duracion;
      let badge = "", past = false;
      if (esHoy) {
        if (m >= ini && m < fin) badge = `<span class="badge live">En curso</span>`;
        else if (m >= fin) past = true;
        else if (!marcadaProxima) { badge = `<span class="badge next">Próxima</span>`; marcadaProxima = true; }
      }
      return `<div class="class${past ? " past" : ""}" style="--d:${Math.min(i, 8) * 40}ms">
        <time>${c.hora}</time>
        <div><h3>${esc(c.nombre)}${badge}</h3><p>${c.duracion} min · con ${esc(c.coach)}</p></div>
        ${past ? "" : `<button class="btn btn-ghost" data-book data-clase="${esc(c.nombre)}" data-dia="${c.dia}" data-hora="${c.hora}">Reservar</button>`}
      </div>`;
    }).join("") : `<div class="empty">No hay clases de ${esc(filtro)} este día. Probá con otro día o con "Todas".</div>`;
  }

  $("[data-days]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]");
    if (!b) return;
    diaSel = +b.dataset.day;
    $$("[data-day]").forEach((t) => t.setAttribute("aria-selected", t === b));
    pintarClases();
  });
  $("[data-filters]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    filtro = b.dataset.filter;
    $$("[data-filter]").forEach((t) => t.setAttribute("aria-pressed", t === b));
    pintarClases();
  });

  /* ---------- Planes ---------- */
  let periodo = 1;
  const desc = S.descuentoTrimestral || 0;
  if (desc > 0) $("[data-disc]").textContent = `-${desc}%`;
  else $("[data-billing]").remove();

  function pintarPlanes(recomendado) {
    $("[data-plans]").innerHTML = S.planes.map((p, i) => {
      const mensual = periodo === 3 ? p.precio * (1 - desc / 100) : p.precio;
      const sub = periodo === 3 ? `${money(mensual * 3)} cada 3 meses · ahorrás ${money(p.precio * 3 - mensual * 3)}` : p.bajada;
      const msg = `Hola! Quiero el plan ${p.nombre}${periodo === 3 ? " trimestral" : ""} (${money(mensual)}/mes). ¿Cómo sigo?`;
      return `<div class="plan reveal${p.destacado ? " featured" : ""}${recomendado === p.id ? " recommended" : ""}" id="plan-${p.id}" style="--d:${i * 60}ms">
        ${p.destacado ? `<span class="flag">Más elegido</span>` : ""}
        <h3>${esc(p.nombre)}</h3>
        <div class="price">${money(mensual)}<small> /mes</small></div>
        <p class="sub">${esc(sub)}</p>
        <ul>${p.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <a class="btn ${p.destacado ? "" : "btn-ghost"}" href="${wa(msg)}" target="_blank" rel="noopener">Quiero el plan ${esc(p.nombre)}</a>
      </div>`;
    }).join("");
    observar($$("[data-plans] .reveal"), true);
  }

  const billing = $("[data-billing]");
  function moverPill() {
    if (!billing) return;
    const b = $("[aria-pressed='true']", billing);
    const pill = $(".pill", billing);
    pill.style.width = b.offsetWidth + "px";
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  }
  billing?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-period]");
    if (!b) return;
    periodo = +b.dataset.period;
    $$("[data-period]", billing).forEach((x) => x.setAttribute("aria-pressed", x === b));
    moverPill();
    pintarPlanes(recomendadoActual);
  });

  /* ---------- Recomendador de plan ---------- */
  const resp = {};
  let recomendadoActual = null;
  $$("[data-q]").forEach((grupo) => grupo.addEventListener("click", (e) => {
    const b = e.target.closest(".opt");
    if (!b) return;
    resp[grupo.dataset.q] = b.dataset.v;
    $$(".opt", grupo).forEach((x) => x.setAttribute("aria-pressed", x === b));
    if (Object.keys(resp).length === 3) recomendar();
  }));
  function recomendar() {
    let id, why;
    if (resp.coach === "si") {
      id = "personal";
      why = resp.objetivo === "bajar"
        ? "Con un coach y plan de alimentación vas a ver resultados más rápido y sin lesionarte."
        : "Vas a tener a alguien que te arme cada rutina, te corrija y te empuje a progresar.";
    } else if (resp.dias === "5" || resp.objetivo === "bajar") {
      id = "full";
      why = resp.objetivo === "bajar"
        ? "Combinar musculación con clases grupales es la forma más efectiva de bajar de peso."
        : "Si venís seguido, te conviene tener todo ilimitado: sala y todas las clases.";
    } else {
      id = "base";
      why = "Para entrenar hasta 3 veces por semana a tu ritmo, es lo más conveniente.";
    }
    const plan = S.planes.find((p) => p.id === id) || S.planes[0];
    const box = $("[data-result] .swap");
    const pintar = () => {
      $("[data-r-name]").textContent = plan.nombre;
      $("[data-r-why]").textContent = why;
      const cta = $("[data-r-cta]");
      cta.hidden = false;
      cta.href = `#plan-${plan.id}`;
      cta.textContent = `Ver plan ${plan.nombre}`;
      box.classList.remove("out");
    };
    recomendadoActual = plan.id;
    pintarPlanes(recomendadoActual);
    if (reduce) return pintar();
    box.classList.add("out");
    setTimeout(pintar, 200);
  }

  /* ---------- Opiniones y preguntas ---------- */
  $("[data-rating]").innerHTML = `<strong>${esc(S.puntajeGoogle)}</strong><div><span class="stars">★★★★★</span><br>${S.cantidadResenas} reseñas en Google</div>`;
  $("[data-quotes]").innerHTML = S.opiniones.map((o, i) => `
    <figure class="quote reveal" style="--d:${i * 60}ms">
      <div class="stars" aria-label="${o.estrellas} estrellas">${"★".repeat(o.estrellas)}</div>
      <blockquote><p>"${esc(o.texto)}"</p></blockquote>
      <figcaption class="who"><span class="avatar">${initials(o.nombre)}</span>${esc(o.nombre)}</figcaption>
    </figure>`).join("");
  $("[data-faq]").innerHTML = S.preguntas.map((q) => `<details class="reveal"><summary>${esc(q.p)}</summary><p>${esc(q.r)}</p></details>`).join("");

  /* ---------- Tabla de horario ---------- */
  $("[data-hours]").innerHTML = ORDEN_SEMANA.map((d) => {
    const h = S.horario[d];
    return `<tr class="${d === new Date().getDay() ? "today" : ""}"><td>${DIAS[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Cerrado"}</td></tr>`;
  }).join("");

  /* ---------- Modal de reserva ---------- */
  const modal = $("[data-modal]");
  const form = $("[data-form]");
  const fClase = $("#f-class"), fDia = $("#f-day"), fHora = $("#f-time");
  const SALA = "Musculación (sala libre)";
  fClase.innerHTML = [SALA, ...disciplinas].map((c) => `<option>${esc(c)}</option>`).join("");

  function proximosDias(clase) {
    const out = [];
    const base = new Date();
    for (let i = 0; i < 8 && out.length < 6; i++) {
      const d = new Date(base); d.setDate(base.getDate() + i);
      const dia = d.getDay();
      const horas = horasPara(clase, dia, i === 0);
      if (horas.length) out.push({ d, i, dia });
    }
    return out;
  }
  function horasPara(clase, dia, esHoy) {
    const m = nowMin();
    if (clase === SALA) {
      const h = S.horario[dia];
      if (!h) return [];
      const lista = [];
      for (let t = toMin(h[0]); t <= toMin(h[1]) - 60; t += 60) if (!esHoy || t > m) lista.push(`${String(t / 60 | 0).padStart(2, "0")}:00`);
      return lista;
    }
    return S.clases.filter((c) => c.nombre === clase && c.dia === dia && (!esHoy || toMin(c.hora) > m)).map((c) => c.hora).sort();
  }
  function llenarDias(preDia) {
    const dias = proximosDias(fClase.value);
    fDia.innerHTML = dias.map((x) => `<option value="${x.i}" data-dow="${x.dia}">${etiquetaDia(x.d, x.i)}</option>`).join("") || `<option value="">Sin días disponibles</option>`;
    if (preDia !== undefined) {
      const o = $$("option", fDia).find((op) => +op.dataset.dow === preDia);
      if (o) fDia.value = o.value;
    }
    llenarHoras();
  }
  function llenarHoras(preHora) {
    const op = fDia.selectedOptions[0];
    const horas = op && op.value !== "" ? horasPara(fClase.value, +op.dataset.dow, op.value === "0") : [];
    fHora.innerHTML = horas.map((h) => `<option>${h}</option>`).join("") || `<option value="">—</option>`;
    if (preHora && horas.includes(preHora)) fHora.value = preHora;
  }
  fClase.addEventListener("change", () => llenarDias());
  fDia.addEventListener("change", () => llenarHoras());

  function abrir(btn) {
    const clase = btn?.dataset.clase;
    fClase.value = clase || SALA;
    llenarDias(btn?.dataset.dia !== undefined ? +btn.dataset.dia : undefined);
    if (btn?.dataset.hora) llenarHoras(btn.dataset.hora);
    $("[data-error]").textContent = "";
    modal.showModal();
    if (matchMedia("(pointer: fine)").matches) $("#f-name").focus();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-book]");
    if (b) { e.preventDefault(); abrir(b); }
  });
  $("#f-name").addEventListener("input", () => ($("[data-error]").textContent = ""));
  $("[data-close]").addEventListener("click", () => modal.close());
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("#f-name").value.trim();
    if (!nombre) { $("[data-error]").textContent = "Contanos tu nombre así te reservamos el lugar."; $("#f-name").focus(); return; }
    if (!fHora.value) { $("[data-error]").textContent = "Elegí un día y horario disponible."; return; }
    const op = fDia.selectedOptions[0];
    const d = new Date(); d.setDate(d.getDate() + +op.value);
    const msg = `Hola! Soy ${nombre} y quiero reservar mi clase gratis 💪\n\n` +
      `• Clase: ${fClase.value}\n• Día: ${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}\n• Horario: ${fHora.value}\n• Experiencia: ${$("#f-level").value}`;
    window.open(wa(msg), "_blank", "noopener");
    modal.close();
  });

  /* ---------- Animaciones al hacer scroll ---------- */
  const countUp = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    const fmt = (n) => n.toLocaleString("es-AR") + suf;
    if (reduce) return (el.textContent = fmt(end));
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - t, 4))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-count]", e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -80px 0px" });
  function observar(els, inmediato) {
    els.forEach((el) => (inmediato && el.getBoundingClientRect().top < innerHeight ? el.classList.add("in") : io.observe(el)));
  }

  /* ---------- Nav y barra de celular ---------- */
  const nav = $("#nav"), dock = $("[data-dock]");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 24);
    dock.classList.toggle("show", scrollY > innerHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Datos para Google (SEO local) ---------- */
  const ld = {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    name: S.nombre,
    description: S.descripcion,
    telephone: "+" + S.whatsapp,
    address: S.direccion,
    sameAs: [`https://instagram.com/${S.instagram}`],
    aggregateRating: { "@type": "AggregateRating", ratingValue: S.puntajeGoogle.replace(",", "."), reviewCount: S.cantidadResenas },
    openingHoursSpecification: Object.entries(S.horario).filter(([, h]) => h).map(([d, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d],
      opens: h[0], closes: h[1],
    })),
  };
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(ld);
  document.head.appendChild(s);

  /* ---------- Arranque ---------- */
  pintarEstado();
  $("[data-next-class]").innerHTML = proximaClase();
  pintarClases();
  pintarPlanes();
  moverPill();
  addEventListener("resize", moverPill);
  onScroll();
  observar($$(".reveal, .clip"));
  // Refresca estado y clases cada minuto
  setInterval(() => { pintarEstado(); $("[data-next-class]").innerHTML = proximaClase(); pintarClases(true); }, 60000);
})();
