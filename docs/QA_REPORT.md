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

## Ronda 2 · 24 nov 2026 · tras la refactorización de modularidad (D-15)

Ahora todas las verificaciones viven en el repositorio y las ejecuta GitHub Actions.

| Verificación                                                  | Resultado                                                                  |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `prettier --check`                                            | ✔️ todo el código con formato uniforme                                     |
| Vitest (recomendador, perfiles, bus de eventos, canvas puro)  | ✔️ 35/35                                                                   |
| `astro check` (TypeScript estricto, todo el proyecto)         | ✔️ 0 errores, 0 advertencias                                               |
| Playwright + axe-core, 375 y 1440 px (16 pruebas × 2 tamaños) | ✔️ 32/32, repetido 2 veces sin fallos (64/64)                              |
| Lighthouse CI móvil (3 corridas, build estático)              | ✔️ Performance 99–100 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100 |

Hallazgos durante la ronda:

- La primera auditoría de axe-core marcó falta de contraste en elementos **a mitad de su animación de entrada**. No era un problema de la página: la prueba medía antes de tiempo. Ahora espera a que terminen las animaciones (`waitForReveals`).
- `astro check` detectó que los archivos de prueba no pasaban el tipado estricto (faltaban los tipos de Node). Se corrigió antes de publicar la integración continua.
- El 79 en Buenas prácticas de la ronda 1 se debía al servidor local de vista previa; con el servidor estático de Lighthouse CI da 100.

## Ronda 3 · 24 nov 2026 · sitio publicado

URL: https://nic-tolb.github.io/landing-ai-academy/ (GitHub Pages, HTTPS).
Flujos de GitHub Actions: «CI» y «Publicar en GitHub Pages» en verde en el primer push.

| Verificación en línea (Edge, 375 y 1440 px)             | Resultado                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Errores de consola y peticiones fallidas                | ✔️ 0                                                                            |
| Desbordamiento horizontal                               | ✔️ 0 px                                                                         |
| Canvas del hero, perfil → ficha «Booster», recomendador | ✔️                                                                              |
| Movimiento reducido: bloques ocultos                    | ✔️ 0                                                                            |
| Lighthouse móvil                                        | Performance **95** · Accesibilidad **100** · Buenas prácticas **100** · SEO 92* |

FCP 1,2 s · LCP 1,3 s · TBT 270 ms · CLS 0 · 122 KiB.
\* SEO pierde puntos solo por `robots.txt`: Lighthouse lo busca en la raíz del dominio (`nic-tolb.github.io/robots.txt`), que no pertenece a este repositorio.

### Pendiente

- Pruebas en dispositivos reales (iOS Safari, Android Chrome de gama media).
- Lector de pantalla (NVDA / VoiceOver).
