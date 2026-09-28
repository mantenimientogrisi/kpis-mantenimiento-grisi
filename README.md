# Portal de KPIs de Mantenimiento Grisi

Portal web ejecutivo, responsivo y actualizable para los indicadores de mantenimiento de Grupo Grisi.

## Uso

Abra `index.html` en Chrome, Edge o Firefox. No requiere instalación ni conexión a internet.

## Contenido

- Filtro por planta: CPV Vallejo, CDT, CPA y CPH.
- Tiempo muerto contra meta.
- Cumplimiento de mantenimiento preventivo contra meta.
- Horas de paro por planta y por equipo.
- Tendencia global de enero a agosto de 2026.
- Descarga de un resumen en texto según la planta seleccionada.
- Módulo de captura mensual con tablas editables.
- Guardado local en el navegador.
- Importación y exportación de respaldos JSON.
- Descarga de `data.js` para publicar la actualización en GitHub Pages.

## Actualización de datos

Presione `Captura mensual`, complete las tres tablas y seleccione `Guardar en este navegador`. Para actualizar la versión pública, seleccione `Descargar data.js` y sustituya ese archivo en el repositorio de GitHub.

GitHub Pages no incluye una base de datos. El guardado local sólo aplica al navegador y equipo donde se realizó la captura. Para compartir las actualizaciones entre varios usuarios se requiere una conexión posterior con Google Sheets, Supabase u otra base de datos.

## Nota sobre la fuente

El formato ejecutivo muestra 280 horas para CPV y concentra 74 horas en la categoría `Otros`. El mantenimiento preventivo de CDT se conserva como `En proceso`, tal como aparece en la fuente.
