# Informe de QA

## Ronda 1 · 24 nov 2026 · build de producción (`astro build` + `astro preview`)

Herramientas: Playwright 1.49 con Microsoft Edge, Lighthouse 12.3 (móvil), Vitest 5, `astro check`.

### Verificación automática

| Prueba                                                                                 | Resultado                                                                |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `astro check` (TypeScript estricto)                                                    | ✔️ 0 errores, 0 advertencias                                             |
| Vitest: lógica del recomendador                                                        | ✔️ 14/14, incluida la regla «las razones son viñetas literales del plan» |
| Errores de consola y peticiones fallidas (375 px y 1440 px)                            | ✔️ 0                                                                     |
| Desbordamiento horizontal (375 px y 1440 px)                                           | ✔️ 0 px                                                                  |
| Canvas del hero dibuja (con y sin movimiento reducido)                                 | ✔️                                                                       |
| Elegir perfil → ficha de misión en la primera pantalla                                 | ✔️ «Booster · 8 horas · en vivo»                                         |
| Perfil → pregunta 2 del recomendador resaltada                                         | ✔️                                                                       |
| Recomendador: en vivo + equipo + automatizar → Liftoff                                 | ✔️                                                                       |
| Filtro de herramientas «Automatizar» → ficha Make                                      | ✔️                                                                       |
| Barra de acción móvil visible fuera del hero                                           | ✔️                                                                       |
| Movimiento reducido: ningún bloque queda oculto                                        | ✔️ 0 ocultos                                                             |
| Teclado: orden de tabulación lógico (saltar → logo → menú → perfiles → CTA → pestañas) | ✔️                                                                       |
| Sin JavaScript: misiones, herramientas y FAQs presentes en el HTML                     | ✔️                                                                       |

### Lighthouse móvil

| Categoría        | Puntaje |
| ---------------- | ------- |
| Performance      | **100** |
| Accesibilidad    | **100** |
| Buenas prácticas | 79*     |
| SEO              | **100** |

FCP 1,2 s · LCP 1,2 s · TBT 10 ms · CLS 0,016 · peso total 121 KiB.
\* Penalizado solo por servirse en local por HTTP/1.1 sin HTTPS; se repite tras publicar.

### Revisión visual (capturas)

- Corregido: el antes/después cortaba palabras al deslizar → interruptor con barrido.
- Corregido: la barra de horas de Liftoff no aparecía en escritorio (dos disparadores de animación medían elementos ya desplazados) → una sola línea de tiempo + red de seguridad.
- Corregido: titular del hero en 4 líneas en escritorio → 3 líneas.

### Pendiente

- Repetir Lighthouse sobre la URL publicada (HTTPS).
- Pruebas en dispositivos reales (iOS Safari, Android Chrome de gama media).
- Lector de pantalla (NVDA / VoiceOver).
