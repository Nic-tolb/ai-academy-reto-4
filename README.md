# Campuslands AI Academy · Nueva landing «Plan de vuelo»

Rediseño de la landing de Campuslands AI Academy con la nueva identidad visual (manual de marca v1.0). Reto de ingreso al equipo, noviembre de 2026.

La narrativa espacial de la marca es la estructura de la página: el recorrido es una cuenta regresiva de nueve fases (T−8 → T−0), las misiones son etapas que se apilan y el despegue (T−0) es la inscripción.

## Piezas interactivas

| Pieza               | Dónde                                                                                 | Qué hace                                                                                                                                                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero que reacciona  | `src/components/Hero.astro`, `src/client/field/`                                      | Campo de trayectorias en canvas: el cursor o el dedo desvían las partículas, un toque lanza una onda. Al elegir _Empresa, Líder de equipo o Independiente_, la trayectoria se dibuja hasta la misión sugerida y el texto y el CTA se adaptan. El scroll acelera el despegue. |
| Recorrido narrativo | `src/components/PhaseRail.astro`, `src/client/features/phases.ts`, `motion.ts`        | Cuenta regresiva T−8 → T−0 en un riel (escritorio) o una barra segmentada (móvil) que indica y permite saltar entre fases; revelado con GSAP ScrollTrigger; las etapas se apilan y sus horas se encienden.                                                                   |
| Recomendador        | `src/components/Recommender.astro`, `src/lib/recommend.ts`, `src/data/recommender.ts` | Hasta 3 preguntas → misión recomendada, razones literales del plan, alternativa y CTA real. Lógica pura cubierta con Vitest.                                                                                                                                                 |
| Exploración libre   | `src/components/Cases.astro`, `Tools.astro`                                           | Antes/después por perfil con barrido (botones o gesto) y constelación de las 14 herramientas filtrable por objetivo.                                                                                                                                                         |

## Stack

| Capa              | Herramienta                                          | Por qué                                                                      |
| ----------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| Sitio             | [Astro 7](https://astro.build) + TypeScript estricto | HTML estático con todo el contenido; JavaScript solo para las interacciones. |
| Estilos           | Sass (tokens + mixins)                               | Paleta y escalas del manual en un solo lugar.                                |
| Movimiento        | GSAP + ScrollTrigger (carga diferida)                | Animaciones ligadas al scroll sin bloquearlo.                                |
| Hero              | Canvas 2D propio                                     | Más liviano y estable en celulares que WebGL.                                |
| Tipografía        | Poppins vía Fontsource                               | Autoalojada, sin depender de terceros.                                       |
| Imágenes          | `astro:assets` + sharp                               | WebP responsivo (logo: 83 kB → 3 kB).                                        |
| Recursos de marca | Python (PyMuPDF, Pillow)                             | Extrae del manual los archivos originales sin redibujarlos.                  |
| Pruebas           | Vitest, Playwright + axe-core, Lighthouse CI         | Lógica, navegador real a 375 / 1440 px, accesibilidad y rendimiento.         |
| Integración       | GitHub Actions                                       | Cada push verifica formato, pruebas, build, navegador y Lighthouse.          |

## Estabilidad

- El HTML trae todo el contenido: sin JavaScript la página se lee completa.
- Cada módulo del navegador arranca aislado (`src/client/main.ts`): si uno falla, el resto sigue.
- Los módulos no se importan entre sí: se comunican por un bus de eventos tipado (`src/client/core/events.ts`).
- Los elementos que un módulo necesita se resuelven al iniciar con `required()`: si falta uno, el error dice cuál.
- El campo del hero se pausa fuera de pantalla o con la pestaña oculta, limita la densidad de píxeles, reduce partículas si el equipo va lento y se congela si aun así no da abasto.
- Si GSAP no carga, nada queda oculto: la clase que oculta los elementos a revelar se añade solo cuando la librería está lista, y una red de seguridad muestra cualquier bloque visible que haya quedado oculto.
- `prefers-reduced-motion`: sin animaciones; el hero muestra una trayectoria fija que igual responde a la elección.

## Cómo correrlo

Requisitos: Node ≥ 22.23.4 y npm.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # verificación de tipos + compilación en dist/
npm run preview    # sirve dist/
npm test           # pruebas unitarias (Vitest)
npm run test:e2e   # pruebas de navegador sobre el build (Playwright + axe-core)
npm run verify     # todo lo anterior, como en la integración continua
```

Las pruebas de navegador usan el Chromium de Playwright (`npx playwright install chromium`). Para usar otro navegador instalado: `PW_CHANNEL=msedge npm run test:e2e`.

### Regenerar los recursos de marca (opcional)

Requiere Python 3.12+ y el PDF del manual.

```bash
python -m venv .venv && .venv/Scripts/activate      # Windows (en macOS/Linux: source .venv/bin/activate)
pip install -r scripts/requirements.txt
python scripts/extract_brand_assets.py "<ruta>/manual-de-marca-ai-academy-v1.pdf" .cache/brand-raw
python scripts/prepare_brand_assets.py .cache/brand-raw src/assets/brand
python scripts/make_favicons.py src/assets/brand/casco-blanco.png public
```

## Estructura

```
src/
  assets/brand/     logos y Max extraídos del manual
  components/       una fase = un componente Astro (Section.astro las envuelve)
  data/             ÚNICA fuente del contenido: misiones, perfiles, preguntas, enlaces, fases
  lib/              lógica pura (recomendador) + pruebas
  client/
    core/           utilidades del DOM y bus de eventos tipado
    features/       un módulo por comportamiento (hero, fases, recomendador, movimiento…)
    field/          canvas del hero: geometría, simulación, monitor, render y controlador
  styles/
    abstracts/      variables y mixins (no emiten CSS)
    base/ layout/   tokens, reinicio, tipografía, secciones
    components/     botón, píldora, chip, tarjeta
tests/e2e/          pruebas de navegador (Playwright + axe-core)
scripts/            utilidades Python para los recursos de marca
docs/               auditoría, requisitos, marca, estrategia, decisiones y QA
```

Cualquier dato de una misión (nombre, duración, contenido) se cambia solo en `src/data/missions.ts`: el hero, el recomendador, la trayectoria y los botones se actualizan solos.

## Uso de IA

Este proyecto se hizo con Claude (Anthropic) como asistente de diseño y desarrollo, dirigido y revisado en cada fase. Las decisiones están documentadas en [`docs/DECISIONS.md`](docs/DECISIONS.md).
