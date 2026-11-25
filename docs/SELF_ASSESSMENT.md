# Autoevaluación con la rúbrica oficial

> Estimación interna (24 nov 2026), no una garantía de la calificación. Evidencia en `REQUIREMENTS.md` y `QA_REPORT.md`.

| Criterio                  | Peso    | Estimado | Resumen                                                                            |
| ------------------------- | ------- | -------- | ---------------------------------------------------------------------------------- |
| Experiencia interactiva   | 35      | **31**   | Las cuatro piezas funcionan, se conectan entre sí y están cubiertas por pruebas    |
| Fidelidad a la marca      | 20      | **16**   | Paleta, Poppins, logo y recursos gráficos fieles; faltan fotos de personas reales  |
| Diseño visual y jerarquía | 15      | **13**   | Sistema tipográfico claro y una sola llamada principal por bloque                  |
| Calidad técnica           | 20      | **19**   | Código modular y tipado, 35 pruebas unitarias, 36 de navegador, CI, Lighthouse 100 |
| Móvil y accesibilidad     | 10      | **9**    | 375 px completo, teclado, axe-core limpio, movimiento reducido                     |
| **Total**                 | **100** | **88**   |                                                                                    |

## Experiencia interactiva · 31 / 35

**Cumplido**

- Hero: canvas que reacciona al cursor, al dedo (onda al tocar) y al scroll; la elección de perfil dibuja la trayectoria hasta la misión y muestra la ficha en la primera pantalla, también a 375 px.
- Recorrido: cuenta regresiva T−8 → T−0 coherente, con riel o barra que indica y permite saltar; las etapas se apilan y sus horas se encienden.
- Recomendador: hasta 3 preguntas, razones literales del plan, alternativa y CTA real; la elección del hero sugiere la pregunta 2.
- Exploración: antes/después con barrido y gesto, y constelación de herramientas filtrable.

**Por qué no es 35**

- La demo corta de un prompt en acción (prevista en la dirección creativa) no se construyó.
- La constelación es una cuadrícula escalonada; podría ser más exploratoria (líneas que unan herramientas según el objetivo).

## Fidelidad a la marca · 16 / 20

**Cumplido**: solo la paleta oficial (auditado en el CSS y el JS compilados), Poppins autoalojada, logo original extraído del manual con zona de protección y tamaño mínimo verificados por pruebas, halos en esquinas, píldoras, palabra destacada, Max con expresiones aprobadas, voz del manual (sin «revolucionario» ni promesas sin caso).

**Por qué no es 20**

- **Personas reales**: el reto y el manual las piden; no hay fotos autorizadas de trainers o formaciones (R2). Es la brecha más visible.
- El mensaje prellenado de WhatsApp aún dice «IA Academy» (R7, pendiente de aprobación).

## Diseño visual y jerarquía · 13 / 15

**Cumplido**: escala tipográfica fluida, ritmo regular entre secciones, CTA destacados en Evox Purple, una llamada principal por bloque.

**Por qué no es 15**: algunas secciones intermedias (reseñas, beneficios) son más convencionales que el hero y las misiones; sin fotografía, el ritmo visual depende casi solo de la tipografía.

## Calidad técnica · 19 / 20

**Cumplido**: Astro + TypeScript estricto, datos con fuente única, módulos aislados que se comunican por un bus tipado, canvas dividido en partes puras y probadas, 35 pruebas unitarias, 36 de navegador (también contra el sitio publicado), Prettier, GitHub Actions y Lighthouse CI con umbral; 0 errores en consola; Lighthouse móvil 100/100/100/100 en el sitio publicado.

**Por qué no es 20**: falta probar en dispositivos físicos (iOS Safari, Android de gama media).

## Móvil y accesibilidad · 9 / 10

**Cumplido**: experiencia completa a 375 px con equivalentes táctiles, teclado, foco visible, axe-core sin infracciones graves, `prefers-reduced-motion`, contenido completo sin JavaScript.

**Por qué no es 10**: no se ha probado con un lector de pantalla real (NVDA o VoiceOver).

## Qué subiría la nota

1. Fotos reales y autorizadas de formaciones o trainers (marca +2 a +3).
2. Demo corta de un prompt en acción dentro del antes/después (interactividad +2).
3. Corregir el texto del mensaje de WhatsApp si se aprueba (marca +1).
