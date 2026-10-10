# Cómo usar las plantillas

```
comun/        ← base compartida (no tocar): estilos, editor y funciones comunes
gimnasio/     ← plantilla de gimnasio
peluqueria/   ← plantilla de peluquería / barbería / estética
```

Cada plantilla tiene:
- `index.html` y `app.js`: la página (no hace falta tocarlos).
- `config.js`: **todo el contenido y el diseño** de ese cliente.
- `editor.html` + `esquema.js`: el **editor visual** con vista previa en vivo.

## Armar la página de un cliente nuevo

1. Pedile los datos con **FICHA-GIMNASIO.md** o **FICHA-PELUQUERIA.md**.
2. Copiá la carpeta de la plantilla (por ejemplo `gimnasio/` → `gym-titan/`), dejándola al lado de `comun/`.
3. Abrí `editor.html` de esa carpeta en el navegador:
   - Cargá los datos, elegí estilo, color y tipografía, y ordená las secciones.
   - Mirá cómo queda en computadora y celular.
   - Tocá **Descargar config.js** y reemplazá el `config.js` de la carpeta.
4. Publicá la carpeta del cliente **junto con `comun/`** (Netlify, Vercel o Cloudflare Pages) y conectá su dominio.

El editor guarda un borrador en el navegador. "Cargar config.js" abre la configuración de otro cliente.

## Que el dueño actualice solo (planilla de Google)

En el editor, sección "Planilla de Google", pegás los links CSV publicados
(Google Sheets → Archivo → Compartir → Publicar en la web → hoja → CSV).
El dueño edita la planilla y la web toma los cambios sola (Google tarda unos minutos).
Si la planilla falla, la página usa `config.js`.

| Plantilla | Hoja | Columnas |
|---|---|---|
| Gimnasio | clases | dia, hora, clase, coach, duracion |
| Gimnasio | planes | nombre, precio, bajada, incluye (separado por ;), destacado (si/no), linkPago |
| Peluquería | ocupados | fecha, hora, duracion, profesional (vacío = todo el salón) |
| Peluquería | servicios | categoria, nombre, precio, duracion, detalle, porlargo (si/no) |
| Las dos | aviso | texto, hasta, link |

## Qué hace cada plantilla

### Gimnasio
- Promo con cuenta regresiva, estado **abierto / cerrado / feriado** y **clase en curso / próxima clase** en vivo.
- **Horarios** por día o **grilla de la semana completa**, con filtros por disciplina y por coach. Tocar una clase abre la reserva ya completa.
- **"¿Hay mucha gente ahora?"**: gráfico hora por hora con la hora actual y el horario más tranquilo.
- **Reserva de clase gratis** por WhatsApp, **"Agregar a mi calendario"** e **"Invitá a un amigo"**.
- **Recomendador de plan**, precios mensual/trimestral, pase diario, **pago online con Mercado Pago**.
- **Resultados antes/después**, coaches con "Ver sus clases", galería ampliable, **calculadora de calorías**.
- Opiniones, preguntas, mapa, barra fija en celular, SEO local. 5 estilos y 3 tipografías.

### Peluquería
- **Turnos en 5 pasos con disponibilidad real**: tiene en cuenta horario, feriados, **qué días trabaja cada profesional**, qué servicios hace y los **turnos ya ocupados** (planilla).
- **Precio según el largo del pelo**, **combos con descuento automático**, descuento primera vez, **seña con Mercado Pago**.
- "Próximo turno libre" en la portada, días con "Últimos" turnos, **"Agregar a mi calendario"**.
- Menú de precios con **buscador** y categorías, antes/después, galería ampliable, equipo con "Reservar con…".
- **Tarjeta de fidelidad**, **gift cards** con vista previa, opiniones, preguntas, mapa, SEO local. 5 estilos y 3 tipografías.

## Importante
Los pedidos llegan **por WhatsApp** y el negocio confirma. La peluquería solo sabe qué horarios están
ocupados si se cargan en la planilla (o en el editor).

## Mantenimiento mensual (lo que cobrás)
Precios, horarios, clases, promos, feriados, fotos y opiniones nuevas, dominio y hosting.
Con la planilla conectada, el día a día lo maneja el dueño y vos cobrás por el servicio y las mejoras.
