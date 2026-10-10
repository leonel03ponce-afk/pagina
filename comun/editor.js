/* =====================================================================
   EDITOR VISUAL GENÉRICO
   Lee window.SITE (config.js) y window.ESQUEMA (esquema.js del rubro),
   arma el formulario, muestra la vista previa en vivo y exporta config.js.
   ===================================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const E = window.ESQUEMA;
  const ORIGINAL = JSON.parse(JSON.stringify(window.SITE));
  const KEY = "editor-borrador:" + location.pathname;
  const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const ORDEN = [1, 2, 3, 4, 5, 6, 0];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let st;
  try { st = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  st = st || JSON.parse(JSON.stringify(ORIGINAL));

  const get = (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), st);
  const set = (path, v) => { const ks = path.split("."); const last = ks.pop(); let o = st; for (const k of ks) { if (o[k] == null) o[k] = {}; o = o[k]; } o[last] = v; };
  const lista = (k) => (Array.isArray(st[k]) ? st[k] : (st[k] = []));

  /* ---------- Estructura ---------- */
  document.body.innerHTML = `
    <div class="top">
      <h1>Editor · ${esc(E.titulo)} <small data-saved></small></h1>
      <button class="b" data-import>Cargar config.js</button>
      <button class="b" data-reset>Volver al original</button>
      <button class="b main" data-export>Descargar config.js</button>
      <input type="file" accept=".js,.json" hidden data-file>
    </div>
    <div class="tabs-m"><button class="b" data-view-btn="form">Editar</button><button class="b" data-view-btn="preview">Vista previa</button></div>
    <div class="layout" data-view="form">
      <div class="panel" data-panel></div>
      <div class="preview">
        <div class="pbar"><button class="b sm" data-device="desktop" aria-pressed="true">Computadora</button><button class="b sm" data-device="mobile" aria-pressed="false">Celular</button></div>
        <div class="frame" data-frame><iframe src="index.html?preview" title="Vista previa" data-iframe></iframe></div>
      </div>
    </div>
    <div class="toast" data-toast></div>`;

  /* ---------- Campos ---------- */
  function input(attrs, c, valor) {
    const t = c.tipo || "text";
    if (t === "area") return `<textarea ${attrs} rows="${c.filas || 3}" placeholder="${esc(c.ph || "")}">${esc(valor ?? "")}</textarea>`;
    if (t === "lineas") return `<textarea ${attrs} data-lines rows="${c.filas || 3}">${esc((valor || []).join("\n"))}</textarea>`;
    if (t === "select") return `<select ${attrs}>${c.opciones.map(([v, n]) => `<option value="${esc(v)}" ${String(valor) === String(v) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
    if (t === "dia") return `<select ${attrs} data-num>${ORDEN.map((d) => `<option value="${d}" ${+valor === d ? "selected" : ""}>${DIAS[d].slice(0, 3)}</option>`).join("")}</select>`;
    if (t === "bool") return `<input type="checkbox" ${attrs} data-bool ${valor ? "checked" : ""}>`;
    if (t === "number") return `<input type="number" ${attrs} data-num value="${esc(valor ?? "")}" placeholder="${esc(c.ph || "")}">`;
    if (t === "multi" || t === "dias") {
      const ops = t === "dias" ? ORDEN.map((d) => [d, DIAS[d].slice(0, 3)]) : (typeof c.opciones === "function" ? c.opciones(st) : c.opciones).map((o) => (Array.isArray(o) ? o : [o, o]));
      const sel = (valor || []).map(String);
      return `<div class="checks">${ops.map(([v, n]) => `<label><input type="checkbox" ${attrs} data-multi="${esc(v)}" ${t === "dias" ? "data-num" : ""} ${sel.includes(String(v)) ? "checked" : ""}>${esc(n)}</label>`).join("")}</div>`;
    }
    return `<input type="${t}" ${attrs} value="${esc(valor ?? "")}" placeholder="${esc(c.ph || "")}" ${c.lista ? `list="dl-${c.lista}"` : ""}>`;
  }
  const campo = (c) => c.tipo === "bool"
    ? `<label class="row" style="font-size:14px">${input(`data-path="${c.path}"`, c, get(c.path))} ${esc(c.label)}</label>`
    : `<label class="f">${esc(c.label)}${input(`data-path="${c.path}"`, c, get(c.path))}${c.ayuda ? `<span class="help">${esc(c.ayuda)}</span>` : ""}</label>`;
  function campos(lista) {
    let html = "", buf = [];
    const flush = () => { if (buf.length) html += buf.length === 2 ? `<div class="g2">${buf.join("")}</div>` : buf.join(""); buf = []; };
    for (const c of lista) {
      if (c.ayudaSola) { flush(); html += `<p class="help">${c.ayudaSola}</p>`; continue; }
      if (c.mitad) { buf.push(campo(c)); if (buf.length === 2) flush(); }
      else { flush(); html += campo(c); }
    }
    flush();
    return html;
  }

  /* ---------- Grupos ---------- */
  const G = {};
  G.campos = (g) => campos(g.campos || []);
  G.estilo = () => {
    const t = (st.tema ||= {});
    const claves = Object.keys(E.estilos);
    const actual = t.estilo in E.estilos ? t.estilo : claves[0];
    return `<div class="swatches">${claves.map((k) => { const [n, a, b] = E.estilos[k];
        return `<button class="sw" data-estilo="${k}" aria-pressed="${actual === k}"><i style="background:linear-gradient(135deg,${b} 50%,${a} 50%)"></i><span>${esc(n)}</span></button>`; }).join("")}</div>
      <div class="row"><label class="f" style="flex:1">Color principal<input type="color" data-color value="${esc(t.acento || E.estilos[actual][1])}"></label>
        <button class="b sm" data-color-reset style="margin-top:17px">Usar el del estilo</button></div>
      <label class="f">Tipografía de títulos<select data-path="tema.tipografia">${E.tipografias.map(([v, n]) => `<option value="${v}" ${t.tipografia === v ? "selected" : ""}>${esc(n)}</option>`).join("")}</select></label>`;
  };
  G.secciones = () => {
    const secs = lista("secciones");
    const orden = [...secs.filter((k) => E.secciones[k]), ...Object.keys(E.secciones).filter((k) => !secs.includes(k))];
    return `<div class="order">${orden.map((k, i) => {
      const on = secs.includes(k);
      return `<div class="it${on ? "" : " off"}"><label><input type="checkbox" data-sec="${k}" ${on ? "checked" : ""}>${esc(E.secciones[k])}</label>
        <button class="mini" data-move="${k}" data-dir="-1" ${!on || i === 0 ? "disabled" : ""} aria-label="Subir">↑</button>
        <button class="mini" data-move="${k}" data-dir="1" ${!on || i >= secs.length - 1 ? "disabled" : ""} aria-label="Bajar">↓</button></div>`;
    }).join("")}</div>`;
  };
  G.horario = () => {
    st.horario ||= {};
    return `${ORDEN.map((d) => { const h = st.horario[d]; return `<div class="hrow"><span>${DIAS[d]}</span>
        <input type="checkbox" data-open="${d}" ${h ? "checked" : ""} aria-label="Abierto el ${DIAS[d]}">
        <input type="time" data-h="${d}" data-p="0" value="${h ? h[0] : ""}" ${h ? "" : "disabled"}>
        <input type="time" data-h="${d}" data-p="1" value="${h ? h[1] : ""}" ${h ? "" : "disabled"}></div>`; }).join("")}
      <p class="help" style="margin-top:6px"><b>Feriados y días cerrados</b></p>
      ${lista("feriados").map((f, i) => `<div class="g2" style="grid-template-columns:1fr 1fr 28px">
        <input type="date" data-list="feriados" data-i="${i}" data-k="fecha" value="${esc(f.fecha)}">
        <input data-list="feriados" data-i="${i}" data-k="motivo" value="${esc(f.motivo)}" placeholder="Motivo">
        <button class="mini b del" data-del="feriados" data-i="${i}" aria-label="Borrar">✕</button></div>`).join("")}
      <button class="b sm" data-add="feriados">+ Agregar feriado</button>`;
  };
  G.tabla = (g) => {
    const items = lista(g.lista), cols = g.columnas;
    const tpl = cols.map((c) => c.ancho || "1fr").join(" ") + " 28px";
    const datalists = cols.filter((c) => c.lista).map((c) => `<datalist id="dl-${c.lista}">${[...new Set((typeof c.fuente === "function" ? c.fuente(st) : items.map((x) => x[c.k])).filter(Boolean))].map((v) => `<option value="${esc(v)}">`).join("")}</datalist>`).join("");
    return `<div class="ctable"><div class="crow head" style="grid-template-columns:${tpl}">${cols.map((c) => `<span>${esc(c.label)}</span>`).join("")}<span></span></div>
      ${items.map((it, i) => `<div class="crow" style="grid-template-columns:${tpl}">${cols.map((c) => input(`data-list="${g.lista}" data-i="${i}" data-k="${c.k}"`, c, it[c.k])).join("")}
        <button class="mini b del" data-del="${g.lista}" data-i="${i}" aria-label="Borrar">✕</button></div>`).join("")}</div>${datalists}
      <div class="row"><button class="b sm" data-add="${g.lista}">+ Agregar</button>${g.ordenar ? `<button class="b sm" data-sort="${g.lista}">Ordenar</button>` : ""}</div>
      ${g.campos ? campos(g.campos) : ""}`;
  };
  G.tarjetas = (g) => {
    const items = lista(g.lista);
    return `${items.map((it, i) => {
      let html = "", buf = [];
      const flush = () => { if (buf.length) html += buf.length === 2 ? `<div class="g2">${buf.join("")}</div>` : buf.join(""); buf = []; };
      for (const c of g.campos) {
        const attrs = `data-list="${g.lista}" data-i="${i}" data-k="${c.k}"`;
        const f = c.tipo === "bool" ? `<label class="row" style="font-size:14px">${input(attrs, c, it[c.k])} ${esc(c.label)}</label>` : `<label class="f">${esc(c.label)}${input(attrs, c, it[c.k])}</label>`;
        if (c.mitad) { buf.push(f); if (buf.length === 2) flush(); } else { flush(); html += f; }
      }
      flush();
      return `<div class="item"><div class="item-head">${esc(it[g.tituloK] || `${g.singular} ${i + 1}`)}
        <span class="row"><button class="mini" data-up="${g.lista}" data-i="${i}" ${i === 0 ? "disabled" : ""} aria-label="Subir">↑</button>
        <button class="b sm del" data-del="${g.lista}" data-i="${i}">Borrar</button></span></div>${html}</div>`;
    }).join("")}${g.campos.filter((c) => c.lista).map((c) => `<datalist id="dl-${c.lista}">${[...new Set(items.map((x) => x[c.k]).filter(Boolean))].map((v) => `<option value="${esc(v)}">`).join("")}</datalist>`).join("")}<button class="b sm" data-add="${g.lista}">+ Agregar ${esc(g.singular.toLowerCase())}</button>${g.extra ? campos(g.extra) : ""}`;
  };
  G.json = (g) => `${g.ayuda ? `<p class="help">${esc(g.ayuda)}</p>` : ""}<p class="help">Editá el resto en formato de datos. Respetá comillas y comas; si hay un error, no se aplica.</p>
    <textarea rows="16" data-json style="font-family:ui-monospace,monospace;font-size:12px">${esc(JSON.stringify(Object.fromEntries(g.claves.map((k) => [k, st[k]])), null, 2))}</textarea>
    <p class="help" data-json-msg></p>`;

  function pintar() {
    const abiertos = $$("details.sec").map((d) => d.open);
    const y = $("[data-panel]").scrollTop;
    $("[data-panel]").innerHTML = E.grupos.map((g, i) => {
      const sub = typeof g.sub === "function" ? g.sub(st) : g.sub || "";
      return `<details class="sec"${(abiertos[i] ?? g.abierto) ? " open" : ""}><summary>${esc(g.titulo)}<small>${esc(sub)}</small></summary>
        <div class="body">${G[g.tipo || "campos"](g)}</div></details>`;
    }).join("");
    $("[data-panel]").scrollTop = y;
  }

  /* ---------- Cambios ---------- */
  let timer;
  function cambio(repintar) {
    if (repintar) pintar();
    clearTimeout(timer);
    timer = setTimeout(() => {
      enviar();
      try { localStorage.setItem(KEY, JSON.stringify(st)); $("[data-saved]").textContent = "· borrador guardado"; } catch (e) {}
    }, 150);
  }
  function valor(el) {
    if (el.dataset.bool !== undefined) return el.checked;
    if (el.dataset.lines !== undefined) return el.value.split("\n").map((x) => x.trim()).filter(Boolean);
    if (el.dataset.num !== undefined) return el.value === "" ? "" : +el.value;
    return el.value;
  }
  const panel = $("[data-panel]");
  panel.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.multi !== undefined) {
      const cont = el.closest(".checks");
      const vals = $$("input:checked", cont).map((x) => (x.dataset.num !== undefined ? +x.dataset.multi : x.dataset.multi));
      if (el.dataset.path) set(el.dataset.path, vals); else st[el.dataset.list][+el.dataset.i][el.dataset.k] = vals;
      return cambio();
    }
    if (el.dataset.path) { set(el.dataset.path, valor(el)); return cambio(); }
    if (el.dataset.list) { st[el.dataset.list][+el.dataset.i][el.dataset.k] = valor(el); return cambio(); }
    if (el.dataset.color !== undefined) { st.tema.acento = el.value; return cambio(); }
    if (el.dataset.h) { st.horario[el.dataset.h][+el.dataset.p] = el.value; return cambio(); }
    if (el.dataset.json !== undefined) {
      try { Object.assign(st, JSON.parse(el.value)); $("[data-json-msg]").textContent = "✓ Aplicado"; cambio(); }
      catch (err) { $("[data-json-msg]").textContent = "Hay un error de formato: " + err.message; }
    }
  });
  panel.addEventListener("change", (e) => {
    const el = e.target;
    if (el.dataset.sec) {
      const k = el.dataset.sec;
      st.secciones = el.checked ? [...lista("secciones"), k] : lista("secciones").filter((x) => x !== k);
      return cambio(true);
    }
    if (el.dataset.open) { st.horario[el.dataset.open] = el.checked ? ["09:00", "20:00"] : null; return cambio(true); }
  });
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.estilo) { st.tema.estilo = b.dataset.estilo; st.tema.acento = ""; return cambio(true); }
    if (b.dataset.colorReset !== undefined) { st.tema.acento = ""; return cambio(true); }
    if (b.dataset.move) {
      const s = st.secciones, i = s.indexOf(b.dataset.move), j = i + +b.dataset.dir;
      [s[i], s[j]] = [s[j], s[i]];
      return cambio(true);
    }
    if (b.dataset.up) { const l = st[b.dataset.up], i = +b.dataset.i; [l[i - 1], l[i]] = [l[i], l[i - 1]]; return cambio(true); }
    if (b.dataset.del) { st[b.dataset.del].splice(+b.dataset.i, 1); return cambio(true); }
    if (b.dataset.add) {
      const nuevo = b.dataset.add === "feriados" ? { fecha: "", motivo: "Feriado" } : E.grupos.find((g) => g.lista === b.dataset.add).nuevo();
      lista(b.dataset.add).push(nuevo);
      return cambio(true);
    }
    if (b.dataset.sort) { E.grupos.find((g) => g.lista === b.dataset.sort).ordenar(st[b.dataset.sort]); return cambio(true); }
  });

  /* ---------- Vista previa ---------- */
  const iframe = $("[data-iframe]");
  const enviar = () => iframe.contentWindow?.postMessage({ type: "site", site: st }, "*");
  addEventListener("message", (e) => { if (e.data?.type === "preview-ready") enviar(); });
  iframe.addEventListener("load", enviar);
  $$("[data-device]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-device]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    $("[data-frame]").classList.toggle("mobile", b.dataset.device === "mobile");
  }));
  $$("[data-view-btn]").forEach((b) => b.addEventListener("click", () => ($(".layout").dataset.view = b.dataset.viewBtn)));

  /* ---------- Exportar / importar ---------- */
  const toast = (t) => { const el = $("[data-toast]"); el.textContent = t; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2400); };
  $("[data-export]").addEventListener("click", () => {
    const txt = `/* Configuración de ${st.negocio?.nombre || "la página"} — generada con editor.html.\n   Reemplazá el config.js de la carpeta por este archivo. */\nwindow.SITE = ${JSON.stringify(st, null, 2)};\n`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/javascript" }));
    a.download = "config.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("Descargado. Reemplazá el config.js de la carpeta por este.");
  });
  $("[data-import]").addEventListener("click", () => $("[data-file]").click());
  $("[data-file]").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const txt = await f.text();
      const fake = {};
      if (f.name.endsWith(".json")) fake.SITE = JSON.parse(txt);
      else new Function("window", txt)(fake);
      if (!fake.SITE) throw new Error("no encontré window.SITE");
      st = fake.SITE;
      cambio(true);
      toast("Configuración cargada");
    } catch (err) { toast("No se pudo leer el archivo: " + err.message); }
    e.target.value = "";
  });
  $("[data-reset]").addEventListener("click", () => {
    if (!confirm("¿Descartar los cambios y volver al config.js original?")) return;
    st = JSON.parse(JSON.stringify(ORIGINAL));
    try { localStorage.removeItem(KEY); } catch (e) {}
    $("[data-saved]").textContent = "";
    cambio(true);
  });

  pintar();
})();
