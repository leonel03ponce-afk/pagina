# Cómo adaptar una página para un cliente

Cada página tiene **un solo archivo para editar**: `config.js`.
Ahí están el nombre, el WhatsApp, la dirección, los precios, los horarios, las clases, los servicios y el equipo.
No hace falta tocar `index.html` ni `app.js`.

## Pasos para un cliente nuevo

1. Copiá la carpeta (`gimnasio/` o `peluqueria/`) y ponele el nombre del negocio.
2. Abrí `config.js` y cambiá:
   - `nombre`, `direccion`, `instagram`
   - `whatsapp`: formato `549` + característica + número, sin espacios ni `+` (ej: `5491123456789`)
   - `mapa`: lo que se buscaría en Google Maps para encontrar el local
   - `horario`, precios, clases o servicios
   - Fotos: pegá el link de cada foto del cliente (si una foto no carga, se ve un fondo de diseño)
3. Los colores están al principio de `index.html`, en `:root` (`--accent` en el gimnasio, `--gold` en la peluquería).
4. Publicala (Netlify, Vercel o Cloudflare Pages: arrastrás la carpeta y listo) y conectale el dominio del cliente.

## Qué hace cada página

### Gimnasio
- Cartel de **abierto / cerrado** en vivo y la **próxima clase**.
- **Horarios por día** con filtro por disciplina, clase "En curso" y "Próxima".
- **Reserva de clase gratis**: el cliente elige clase, día y horario, y le llega al gimnasio por WhatsApp con todo armado.
- **Recomendador de plan** (3 preguntas).
- Precios **mensual / trimestral** con descuento calculado solo.
- Opiniones, preguntas frecuentes, mapa, "Cómo llegar" y barra fija en celular.
- Datos para que Google muestre horario y puntaje (SEO local).

### Peluquería
- **Turnos online en 5 pasos**: servicios (varios), profesional, día, horario y datos.
  - Solo ofrece profesionales que hacen esos servicios.
  - Calcula duración y total, y solo muestra horarios donde entra el servicio.
  - Respeta días cerrados, feriados y la anticipación mínima.
  - El pedido llega por WhatsApp listo para confirmar.
- **Gift cards** con vista previa en vivo.
- **Antes / después** deslizable.
- Menú de precios por categoría, equipo con "Reservar con…", opiniones, preguntas, mapa y SEO local.

## Importante
Los turnos llegan como **pedido por WhatsApp**: la página no sabe qué horarios ya están ocupados.
El negocio confirma cada turno. Si un cliente necesita agenda con horarios ocupados en tiempo real,
se puede conectar a Google Calendar o a un sistema de turnos (servicio premium).

## Mantenimiento mensual (lo que cobrás)
- Actualizar precios, horarios, clases y promociones.
- Cambiar fotos de trabajos y opiniones nuevas.
- Feriados y vacaciones (`feriados` en la peluquería).
- Dominio, hosting y que todo funcione.
