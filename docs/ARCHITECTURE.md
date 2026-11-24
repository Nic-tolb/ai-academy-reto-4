# Arquitectura técnica

> Estado: **implementado** (24 nov 2026).

## Principios
1. **Contenido primero**: todo el texto y los enlaces se renderizan en el servidor (Astro). El JavaScript solo mejora.
2. **Fallar en silencio, nunca romper**: cada módulo del navegador se inicia dentro de `safe()`; los errores se registran como advertencia y el resto continúa.
3. **Carga diferida**: GSAP y el campo del hero se importan dinámicamente cuando el navegador está libre (`requestIdleCallback`).
4. **Una fuente de verdad**: el contenido vive en `src/data/*.ts`, tipado; los componentes y los scripts lo leen de ahí.

## Flujo de datos
```
src/data (contenido, enlaces, fases, misiones)
   ├─► componentes Astro (HTML estático)
   └─► src/lib/recommend.ts (lógica pura, Vitest)
            └─► src/scripts/modules/recommender.ts (interfaz)

hero.ts ──emit('profile')──► recommender.ts (resalta la pregunta 2)
   └──► field.ts (setTarget)          motion.ts ──► field.setBoost(scroll)
recommender.ts ──emit('recommenderFocus')──► action-bar.ts (oculta la barra)
```

## Módulos del navegador
| Módulo | Responsabilidad | Si falla… |
|---|---|---|
| `header` | filete del encabezado, relleno del riel | el encabezado se ve sin filete |
| `menu` | menú móvil accesible | el menú no abre; los enlaces siguen en el pie |
| `phases` | fase activa | el riel no marca la fase |
| `action-bar` | barra móvil de CTA | la barra no aparece; los CTA siguen en cada sección |
| `hero` + `hero/field` | elección de perfil + canvas | la elección funciona sin canvas |
| `recommender` | preguntas y resultado | se muestra el aviso y las misiones |
| `cases`, `tools` | exploración | se ven todos los textos apilados |
| `motion` | GSAP | todo queda visible sin animación |

## Rendimiento (Lighthouse móvil, build local)
Performance 100 · Accesibilidad 100 · SEO 100 · Peso total 121 KiB · LCP 1,2 s · CLS 0,016. Detalle en `QA_REPORT.md`.
