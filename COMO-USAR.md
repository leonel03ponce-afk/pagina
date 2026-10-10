# Cómo adaptar una página para un cliente

Cada página tiene **un solo archivo para editar**: `config.js`.
Ahí están el nombre, el WhatsApp, la dirección, los precios, los horarios, las clases, los servicios y el equipo.
No hace falta tocar `index.html` ni `app.js`.

## Gimnasio: cómo armar uno nuevo

1. Pedile los datos al dueño con **FICHA-GIMNASIO.md**.
2. Copiá la carpeta `gimnasio/` y ponele el nombre del negocio.
3. Abrí **`editor.html`** en el navegador (doble clic). Ahí, con vista previa en computadora y celular:
   - Cargás nombre, contacto, dirección, clases, planes, coaches, horario y feriados.
   - Elegís el estilo (Neón, Fuego, Océano, Oro o Claro), el color y la tipografía.
   - Activás, ocultás y reordenás secciones.
   - Tocás **Descargar config.js** y reemplazás el `config.js` de la carpeta.
4. Publicala (Netlify, Vercel o Cloudflare Pages: arrastrás la carpeta) y conectá el dominio.

El editor guarda un borrador en ese navegador. "Cargar config.js" abre la configuración de otro cliente.

### Que el dueño actualice solo (planilla de Google)
En la sección "Planilla de Google" del editor pegás los links CSV publicados de tres hojas:
- **clases**: dia | hora | clase | coach | duracion
- **planes**: nombre | precio | bajada | incluye (separado por ;) | destacado (si/no) | linkPago
- **aviso**: texto | hasta | link

El dueño edita la planilla y la web toma los cambios sola (Google tarda unos minutos en actualizar el CSV).
Si la planilla falla, la página usa los datos de `config.js`.

## Qué hace cada página

### Gimnasio
- Barra de **promoción con cuenta regresiva**, que se oculta sola al vencer.
- Cartel **abierto / cerrado / feriado** en vivo y **próxima clase**.
- **Horarios por día** con filtros por disciplina y por coach, clase "En curso" y "Próxima", y aviso de feriado.
- **Reserva de clase gratis** por WhatsApp y botón **"Agregar a mi calendario"** con recordatorio 1 h antes.
- **Recomendador de plan**, que funciona con cualquier cantidad de planes.
- Precios **mensual / trimestral**, **pase diario** y botón **"Pagar online"** de Mercado Pago.
- **Coaches** con "Ver sus clases", **galería** con fotos en grande (flechas y deslizar).
- **Calculadora de calorías y macros**, que termina en un pedido de plan por WhatsApp.
- Opiniones con link para dejar reseña, preguntas frecuentes, mapa, "Cómo llegar", barra fija en celular.
- 5 estilos de color, 3 tipografías, logo propio, video de fondo y SEO local.

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
