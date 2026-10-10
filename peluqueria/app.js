(() => {
  const S = window.SITE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const DIAS_CORTOS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

  const toMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  const toHora = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const durTxt = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}`);
  const wa = (msg) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const mismoDia = (a, b) => a && b && iso(a) === iso(b);
  const nombreDia = (d) => `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  const desc = S.descuentoPrimeraVez || 0;

  /* ---------- Contenido básico ---------- */
  const [n1, ...nResto] = S.nombre.split(" ");
  const logoHTML = `${esc(n1)} <em>${esc(nResto.join(" "))}</em>`;
  $$("[data-logo]").forEach((el) => (el.innerHTML = logoHTML));
  $("[data-card-brand]").innerHTML = logoHTML;
  $("[data-mono]").textContent = S.nombre.split(" ").map((p) => p[0]).join("").slice(0, 2);
  $("[data-kicker]").textContent = `${S.rubro} · desde ${S.desde}`;
  $("[data-bajada]").textContent = S.bajada;
  $("[data-proof]").innerHTML = `<b>${esc(S.puntajeGoogle)}</b><div><span class="stars">★★★★★</span><br>${S.cantidadResenas} reseñas en Google</div>`;
  $("[data-rating-kicker]").textContent = `★★★★★ · ${S.puntajeGoogle} en Google`;
  if (S.fotoPortada) $("[data-hero-img]").src = S.fotoPortada; else $("[data-hero-img]").remove();
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
  if (desc > 0) $("[data-first-label]").textContent = `Es mi primera vez (${desc}% de descuento)`;

  /* ---------- Abierto / cerrado ---------- */
  function cerradoEl(d) { return !S.horario[d.getDay()] || S.feriados.includes(iso(d)); }
  function pintarEstado() {
    const d = new Date(), m = nowMin(), hoy = S.horario[d.getDay()];
    const el = $("[data-status]");
    let txt = "Cerrado", sub = "";
    if (!cerradoEl(d) && m >= toMin(hoy[0]) && m < toMin(hoy[1])) { txt = "Abierto"; sub = `hasta las ${hoy[1]}`; }
    else {
      for (let i = 0; i < 14; i++) {
        const x = new Date(d); x.setDate(d.getDate() + i);
        if (cerradoEl(x)) continue;
        const h = S.horario[x.getDay()];
        if (i === 0 && m >= toMin(h[0])) continue;
        sub = `abre ${i === 0 ? "hoy" : i === 1 ? "mañana" : DIAS[x.getDay()].toLowerCase()} ${h[0]}`;
        break;
      }
    }
    el.classList.toggle("open", txt === "Abierto");
    el.innerHTML = `<i></i>${txt}${sub ? ` <span>· ${sub}</span>` : ""}`;
  }

  /* ---------- Estado de la reserva ---------- */
  const st = { svcs: new Set(), pro: "any", prefPro: null, date: null, slot: null };
  const svcById = (id) => S.servicios.find((s) => s.id === id);
  const elegidos = () => S.servicios.filter((s) => st.svcs.has(s.id));
  const duracion = () => elegidos().reduce((a, s) => a + s.duracion, 0);
  const categoriasElegidas = () => [...new Set(elegidos().map((s) => s.categoria))];
  const puedeHacer = (p) => categoriasElegidas().every((c) => p.categorias.includes(c));

  function slotsDe(d) {
    if (!d || cerradoEl(d)) return [];
    const [a, b] = S.horario[d.getDay()];
    const dur = duracion() || S.intervaloTurnos;
    const minimo = mismoDia(d, new Date()) ? nowMin() + S.anticipacionMinima : -1;
    const out = [];
    for (let t = toMin(a); t + dur <= toMin(b); t += S.intervaloTurnos) if (t >= minimo) out.push(toHora(t));
    return out;
  }

  /* ---------- Paso 1: servicios ---------- */
  function pintarServicios() {
    $("[data-pick-svc]").innerHTML = S.servicios.map((s) => `
      <button data-svc="${s.id}" aria-pressed="${st.svcs.has(s.id)}">
        <strong>${esc(s.nombre)}</strong><span>${money(s.precio)} · ${durTxt(s.duracion)}</span>
      </button>`).join("");
  }
  $("[data-pick-svc]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-svc]");
    if (!b) return;
    const id = b.dataset.svc;
    st.svcs.has(id) ? st.svcs.delete(id) : st.svcs.add(id);
    b.setAttribute("aria-pressed", st.svcs.has(id));
    alCambiarServicios();
  });
  function alCambiarServicios() {
    const pro = typeof st.pro === "number" ? S.equipo[st.pro] : null;
    if (pro && !puedeHacer(pro)) st.pro = "any";
    if (st.prefPro !== null && puedeHacer(S.equipo[st.prefPro])) st.pro = st.prefPro;
    if (st.slot && !slotsDe(st.date).includes(st.slot)) st.slot = null;
    pintarTodo();
  }

  /* ---------- Paso 2: profesional ---------- */
  function pintarPros() {
    const cats = categoriasElegidas();
    $("[data-pick-pro]").innerHTML =
      `<button data-pro="any" aria-pressed="${st.pro === "any"}"><strong>Sin preferencia</strong><span>Te asignamos a quien esté libre</span></button>` +
      S.equipo.map((p, i) => {
        const ok = puedeHacer(p);
        const falta = cats.filter((c) => !p.categorias.includes(c)).join(", ");
        return `<button data-pro="${i}" aria-pressed="${st.pro === i}" ${ok ? "" : "disabled"}>
          <strong>${esc(p.nombre)}</strong><span>${ok ? esc(p.rol) : `No realiza ${esc(falta.toLowerCase())}`}</span></button>`;
      }).join("");
  }
  $("[data-pick-pro]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pro]");
    if (!b || b.disabled) return;
    st.pro = b.dataset.pro === "any" ? "any" : +b.dataset.pro;
    st.prefPro = st.pro === "any" ? null : st.pro;
    pintarTodo();
  });

  /* ---------- Paso 3: día ---------- */
  function pintarDias() {
    const hoy = new Date();
    let html = "";
    for (let i = 0; i < S.diasParaReservar; i++) {
      const d = new Date(hoy); d.setDate(hoy.getDate() + i);
      const libre = slotsDe(d).length > 0;
      const label = i === 0 ? "Hoy" : i === 1 ? "Mañ" : DIAS_CORTOS[d.getDay()];
      html += `<button class="day" data-date="${iso(d)}" aria-pressed="${mismoDia(d, st.date)}" ${libre ? "" : "disabled"}
        aria-label="${nombreDia(d)}${libre ? "" : " (sin turnos)"}"><small>${label}</small><strong>${d.getDate()}</strong></button>`;
    }
    $("[data-pick-day]").innerHTML = html;
  }
  $("[data-pick-day]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-date]");
    if (!b || b.disabled) return;
    const [y, m, d] = b.dataset.date.split("-").map(Number);
    st.date = new Date(y, m - 1, d);
    if (st.slot && !slotsDe(st.date).includes(st.slot)) st.slot = null;
    pintarTodo();
  });

  /* ---------- Paso 4: horario ---------- */
  function pintarSlots() {
    const box = $("[data-pick-slot]");
    $("[data-dur-hint]").textContent = st.svcs.size ? `Duración aprox. ${durTxt(duracion())}` : "";
    if (!st.date) { box.innerHTML = `<p class="hint">Primero elegí un día.</p>`; return; }
    const slots = slotsDe(st.date);
    if (!slots.length) { box.innerHTML = `<p class="hint">No quedan horarios este día para ${durTxt(duracion())} de servicio. Probá con otro día.</p>`; return; }
    const grupos = [["Mañana", slots.filter((h) => toMin(h) < 13 * 60)], ["Tarde", slots.filter((h) => toMin(h) >= 13 * 60)]].filter((g) => g[1].length);
    box.innerHTML = grupos.map(([t, hs]) => `<div class="slots-group"><p>${t}</p><div class="slots">
      ${hs.map((h) => `<button class="slot" data-slot="${h}" aria-pressed="${st.slot === h}">${h}</button>`).join("")}</div></div>`).join("");
  }
  $("[data-pick-slot]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-slot]");
    if (!b) return;
    st.slot = b.dataset.slot;
    pintarTodo();
  });

  /* ---------- Resumen ---------- */
  $("#b-name").addEventListener("input", () => { pintarResumen(); $('[data-step="5"]').classList.toggle("done", !!$("#b-name").value.trim()); });
  $("#b-note").addEventListener("input", pintarResumen);
  $("#b-first").addEventListener("change", pintarResumen);

  function faltantes() {
    const f = [];
    if (!st.svcs.size) f.push("un servicio");
    if (!st.date) f.push("el día");
    if (!st.slot) f.push("el horario");
    if (!$("#b-name").value.trim()) f.push("tu nombre");
    return f;
  }
  function pintarResumen() {
    const ss = elegidos();
    const subtotal = ss.reduce((a, s) => a + s.precio, 0);
    const primera = $("#b-first").checked && desc > 0;
    const total = primera ? subtotal * (1 - desc / 100) : subtotal;
    const pro = st.pro === "any" ? "Sin preferencia" : S.equipo[st.pro].nombre;
    $("[data-sum]").innerHTML = ss.length ? [
      ...ss.map((s) => `<div class="sum-svc"><span>${esc(s.nombre)}</span><span>${money(s.precio)}</span></div>`),
      `<div class="sum-row"><span>Profesional</span><span>${esc(pro)}</span></div>`,
      st.date ? `<div class="sum-row"><span>Día</span><span>${nombreDia(st.date)}</span></div>` : "",
      st.slot ? `<div class="sum-row"><span>Horario</span><span>${st.slot} a ${toHora(toMin(st.slot) + duracion())}</span></div>` : "",
      primera ? `<div class="sum-row"><span>Primera vez</span><span>−${money(subtotal - total)}</span></div>` : "",
    ].join("") : `<p class="empty-sum">Todavía no elegiste ningún servicio.</p>`;
    const tot = $("[data-sum-total]");
    const nuevo = money(total);
    if (tot.textContent !== nuevo) { tot.textContent = nuevo; if (!reduce) { tot.classList.remove("bump"); void tot.offsetWidth; tot.classList.add("bump"); } }
    $("[data-sum-dur]").textContent = ss.length ? `Duración aprox. ${durTxt(duracion())}` : "";
    const f = faltantes();
    $("[data-send]").disabled = f.length > 0;
    $("[data-missing]").textContent = f.length ? `Falta: ${f.join(", ")}.` : "Te confirmamos por WhatsApp en minutos.";
  }

  function pintarTodo() {
    pintarServicios();
    pintarPros();
    pintarDias();
    pintarSlots();
    const pasos = [true, st.svcs.size > 0, st.svcs.size > 0, !!st.date && st.svcs.size > 0, !!st.slot && st.svcs.size > 0];
    const hechos = [st.svcs.size > 0, st.svcs.size > 0, !!st.date, !!st.slot, !!$("#b-name").value.trim()];
    $$("[data-step]").forEach((el, i) => { el.classList.toggle("locked", !pasos[i]); el.classList.toggle("done", hechos[i] && pasos[i]); });
    pintarResumen();
  }

  $("[data-send]").addEventListener("click", () => {
    if (faltantes().length) return;
    const ss = elegidos();
    const subtotal = ss.reduce((a, s) => a + s.precio, 0);
    const primera = $("#b-first").checked && desc > 0;
    const total = primera ? subtotal * (1 - desc / 100) : subtotal;
    const nota = $("#b-note").value.trim();
    const msg = [
      `Hola! Quiero pedir un turno ✨`,
      ``,
      `• Nombre: ${$("#b-name").value.trim()}`,
      `• Servicio: ${ss.map((s) => s.nombre).join(" + ")}`,
      `• Profesional: ${st.pro === "any" ? "Sin preferencia" : S.equipo[st.pro].nombre}`,
      `• Día: ${nombreDia(st.date)}`,
      `• Horario: ${st.slot} (aprox. ${durTxt(duracion())})`,
      `• Total estimado: ${money(total)}${primera ? ` (con ${desc}% primera vez)` : ""}`,
      nota ? `• Nota: ${nota}` : "",
    ].filter((l, i) => l || i === 1).join("\n");
    window.open(wa(msg), "_blank", "noopener");
  });

  /* ---------- Menú de servicios ---------- */
  const cats = ["Todos", ...new Set(S.servicios.map((s) => s.categoria))];
  let catSel = "Todos";
  $("[data-cats]").innerHTML = cats.map((c) => `<button class="cat" data-cat="${esc(c)}" aria-pressed="${c === catSel}">${esc(c)}</button>`).join("");
  function pintarMenu() {
    $("[data-menu]").innerHTML = S.servicios.filter((s) => catSel === "Todos" || s.categoria === catSel).map((s, i) => `
      <div class="svc" style="--d:${Math.min(i, 8) * 40}ms">
        <h3>${esc(s.nombre)}</h3><span class="price">${money(s.precio)}</span>
        <p>${esc(s.detalle)}</p>
        <div class="meta"><span class="dur">${durTxt(s.duracion)}</span><a href="#turnos" class="link" data-book="${s.id}">Reservar</a></div>
      </div>`).join("");
  }
  $("[data-cats]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    catSel = b.dataset.cat;
    $$("[data-cat]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    pintarMenu();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-book]");
    if (!b) return;
    st.svcs.add(b.dataset.book);
    alCambiarServicios();
  });

  /* ---------- Antes y después ---------- */
  const ad = S.antesDespues;
  const cmp = $("[data-compare]");
  if (ad) {
    $(".before-img", cmp).innerHTML = ad.antes ? `<img src="${esc(ad.antes)}" alt="Antes" onerror="this.remove()">` : "";
    $(".after", cmp).innerHTML = ad.despues ? `<img src="${esc(ad.despues)}" alt="Después" onerror="this.remove()">` : "";
    $("[data-compare-cap]").textContent = ad.titulo;
    $("input", cmp).addEventListener("input", (e) => cmp.style.setProperty("--pos", e.target.value + "%"));
  } else cmp.remove();

  $("[data-gallery]").innerHTML = S.galeria.map((g, i) => `
    <div class="tile clip" style="--d:${i * 70}ms">${g.foto ? `<img src="${esc(g.foto)}" alt="${esc(g.titulo)}" loading="lazy" onerror="this.remove()">` : ""}<span>${esc(g.titulo)}</span></div>`).join("");

  /* ---------- Equipo ---------- */
  $("[data-team]").innerHTML = S.equipo.map((p, i) => `
    <div class="member reveal" style="--d:${i * 80}ms">
      <div class="photo">${p.foto ? `<img src="${esc(p.foto)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()">` : ""}</div>
      <h3>${esc(p.nombre)}</h3><p>${esc(p.rol)}</p>
      <a href="#turnos" class="link" data-pro-book="${i}">Reservar con ${esc(p.nombre.split(" ")[0])}</a>
    </div>`).join("");
  $("[data-team]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-pro-book]");
    if (!b) return;
    st.prefPro = +b.dataset.proBook;
    if (puedeHacer(S.equipo[st.prefPro])) st.pro = st.prefPro;
    pintarTodo();
  });

  /* ---------- Gift card ---------- */
  let monto = S.giftCards[1] ?? S.giftCards[0];
  $("[data-amounts]").innerHTML = S.giftCards.map((m) => `<button data-amount="${m}" aria-pressed="${m === monto}">${money(m)}</button>`).join("");
  function pintarCard() {
    $("[data-card-amt]").textContent = money(monto);
    const para = $("#g-to").value.trim(), de = $("#g-from").value.trim();
    $("[data-card-msg]").textContent = $("#g-msg").value.trim() || "Un momento solo para vos.";
    $("[data-card-to]").textContent = [para && `Para ${para}`, de && `de ${de}`].filter(Boolean).join(" · ") || "Para alguien especial";
  }
  $("[data-amounts]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-amount]");
    if (!b) return;
    monto = +b.dataset.amount;
    $$("[data-amount]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    pintarCard();
  });
  ["#g-to", "#g-from", "#g-msg"].forEach((s) => $(s).addEventListener("input", pintarCard));
  $("[data-gift-send]").addEventListener("click", () => {
    const para = $("#g-to").value.trim(), de = $("#g-from").value.trim(), m = $("#g-msg").value.trim();
    const msg = [`Hola! Quiero comprar una gift card 🎁`, ``, `• Monto: ${money(monto)}`, para && `• Para: ${para}`, de && `• De: ${de}`, m && `• Dedicatoria: "${m}"`]
      .filter((l, i) => l || i === 1).join("\n");
    window.open(wa(msg), "_blank", "noopener");
  });

  /* ---------- Opiniones, preguntas y horario ---------- */
  $("[data-quotes]").innerHTML = S.opiniones.map((o, i) => `
    <figure class="quote reveal" style="--d:${i * 60}ms"><div class="stars">★★★★★</div>
      <blockquote><p>"${esc(o.texto)}"</p></blockquote><figcaption>${esc(o.nombre)}</figcaption></figure>`).join("");
  $("[data-faq]").innerHTML = S.preguntas.map((q) => `<details class="reveal"><summary>${esc(q.p)}</summary><p>${esc(q.r)}</p></details>`).join("");
  $("[data-hours]").innerHTML = ORDEN_SEMANA.map((d) => {
    const h = S.horario[d];
    return `<tr class="${d === new Date().getDay() ? "today" : ""}"><td>${DIAS[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Cerrado"}</td></tr>`;
  }).join("");

  /* ---------- Datos para Google (SEO local) ---------- */
  const ld = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: S.nombre,
    description: S.bajada,
    telephone: "+" + S.whatsapp,
    address: S.direccion,
    sameAs: [`https://instagram.com/${S.instagram}`],
    aggregateRating: { "@type": "AggregateRating", ratingValue: S.puntajeGoogle.replace(",", "."), reviewCount: S.cantidadResenas },
    openingHoursSpecification: Object.entries(S.horario).filter(([, h]) => h).map(([d, h]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d], opens: h[0], closes: h[1],
    })),
    makesOffer: S.servicios.map((s) => ({ "@type": "Offer", name: s.nombre, price: s.precio, priceCurrency: "ARS" })),
  };
  const sc = document.createElement("script");
  sc.type = "application/ld+json";
  sc.textContent = JSON.stringify(ld);
  document.head.appendChild(sc);

  /* ---------- Scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -80px 0px" });
  $$(".reveal, .clip").forEach((el) => io.observe(el));
  const nav = $("#nav"), dock = $("[data-dock]");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 24);
    const t = $("#turnos").getBoundingClientRect();
    dock.classList.toggle("show", scrollY > innerHeight * 0.6 && !(t.top < innerHeight && t.bottom > 0));
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Arranque ---------- */
  pintarEstado();
  pintarMenu();
  pintarCard();
  pintarTodo();
  onScroll();
  setInterval(() => { pintarEstado(); pintarDias(); pintarSlots(); }, 60000);
})();
