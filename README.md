# Portal de KPIs de Mantenimiento Grisi

Portal web ejecutivo y responsivo generado con la información de `Indicadores de mantenimiento.pptx`.

## Uso

Abra `index.html` en Chrome, Edge o Firefox. No requiere instalación ni conexión a internet.

## Contenido

- Filtro por planta: Vallejo, CDT, CPA y CPH.
- Tiempo muerto contra meta.
- Cumplimiento de mantenimiento preventivo contra meta.
- Horas de paro por planta y por equipo.
- Tendencia global de enero a agosto de 2026.
- Descarga de un resumen en texto según la planta seleccionada.

## Actualización de datos

Edite `data.js`. Los valores se encuentran separados por indicador, planta y equipo. La interfaz se actualiza automáticamente al volver a abrir la página.

## Nota sobre la fuente

La presentación muestra 280 horas para Vallejo. Los nueve equipos visibles suman 250 horas, por lo que el portal concentra las 30 horas restantes en la categoría `Otros`. El mantenimiento preventivo de CDT se conserva como `En proceso`, tal como aparece en la fuente.
