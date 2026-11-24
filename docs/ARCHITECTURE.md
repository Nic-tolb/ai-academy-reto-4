# Arquitectura técnica

> Estado: **implementado** · última revisión 24 nov 2026 (refactorización de modularidad, D-15).

## Principios

1. **Contenido primero**: todo el texto y los enlaces se renderizan en el servidor (Astro). El JavaScript solo mejora.
2. **Fallar en silencio, nunca romper**: cada módulo del navegador se inicia dentro de `safe()` (`src/client/main.ts`); un error se registra y el resto continúa.
3. **Una sola fuente de verdad**: los datos de las misiones viven en `src/data/missions.ts`. Hero, recomendador, trayectoria y botones derivan sus textos de ahí; nada se copia a mano.
4. **Sin acoplamiento entre módulos**: se comunican solo por el bus de eventos tipado.
5. **Lógica pura separada del DOM**: lo que puede probarse sin navegador (recomendador, geometría, simulación, monitor de fotogramas, bus) se prueba con Vitest.
6. **Carga diferida**: GSAP y el canvas del hero se importan cuando el navegador está libre.

## Estructura

```
src/
  data/                 fuente única del contenido
    missions.ts         misiones + textos derivados (ctaLabel, summary, brief, shortMeta)
    profiles.ts         perfiles del hero (textos construidos con datos de misiones)
    recommender.ts      preguntas del recomendador (tipadas contra la lógica)
    phases.ts, links.ts, content.ts
  lib/recommend.ts      lógica pura del recomendador (+ pruebas)
  components/           Section.astro envuelve cada fase; SectionHead.astro su encabezado
  client/
    main.ts             arranque aislado de cada módulo
    core/dom.ts         $, $$, required(), whenIdle…
    core/events.ts      bus de eventos tipado (+ pruebas)
    features/           header, menu, phases, action-bar, hero, recommender, cases, tools, motion
    field/              canvas del hero
      geometry.ts       curvas y paradas (puro)
      particles.ts      simulación y fuerzas (puro)
      frame-monitor.ts  aligerar / congelar según rendimiento (puro)
      renderer.ts       solo pinta
      field.ts          controlador: ciclo de vida, eventos, bucle
  styles/               abstracts · base · layout · components · utilities
tests/e2e/              Playwright + axe-core
```

## Comunicación entre módulos (bus de eventos)

```
hero ───────── profile ──────────► recommender   (resalta la pregunta 2)
menu ───────── menuToggle ───────► action-bar    (oculta la barra)
recommender ── recommenderFocus ─► action-bar    (no interrumpe)
motion ─────── heroBoost ────────► hero ► field  (despegue con el scroll)
```

## Módulos del navegador

| Módulo           | Responsabilidad              | Si falla…                                           |
| ---------------- | ---------------------------- | --------------------------------------------------- |
| `header`         | filete del encabezado        | el encabezado se ve sin filete                      |
| `menu`           | menú móvil accesible         | el menú no abre; los enlaces siguen en el pie       |
| `phases`         | fase activa y línea del riel | el riel no marca la fase                            |
| `action-bar`     | barra móvil de CTA           | la barra no aparece; los CTA siguen en cada sección |
| `hero` + `field` | elección de perfil + canvas  | la elección funciona sin canvas                     |
| `recommender`    | preguntas y resultado        | se muestra el aviso y las misiones                  |
| `cases`, `tools` | exploración                  | se ven todos los textos apilados                    |
| `motion`         | GSAP                         | todo queda visible sin animación                    |

## Verificación automática (GitHub Actions, cada push)

Prettier → Vitest → `astro check` + build → Playwright + axe-core (375 y 1440 px) → Lighthouse CI (falla si Performance móvil < 80 o Accesibilidad < 90).
