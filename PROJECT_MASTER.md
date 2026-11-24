# PROJECT MASTER — Nueva landing de Campuslands AI Academy

Reto de ingreso al equipo · Noviembre 2026 · Entregables: **sitio publicado + repositorio público de GitHub**.

## Estado actual
| Fase | Estado |
|---|---|
| 1 · Auditoría e investigación | ✅ Completada (24 nov 2026) — `docs/RESEARCH.md`, `docs/REQUIREMENTS.md`, `docs/BRAND_GUIDELINES.md` |
| 2 · Estrategia de experiencia | 🟨 Propuesta — `docs/UX_STRATEGY.md` |
| 3 · Exploración creativa | 🟨 3 direcciones propuestas — `docs/CREATIVE_DIRECTION.md` — **esperando aprobación** |
| 4 · Diseño y prototipado | ⬜ |
| 5 · Arquitectura técnica | ⬜ (stack preliminar abajo) |
| 6 · Implementación | ⬜ |
| 7 · Control de calidad | ⬜ |
| 8 · Optimización y publicación | ⬜ (requiere autorización) |

## Jerarquía de fuentes
1. Reto oficial (PDF) → 2. Manual de marca (reglas CONFIRMADO/APROBADO) → 3. Datos de la landing actual (`docs/RESEARCH.md`) → 4. Decisiones aprobadas (`docs/DECISIONS.md`) → 5. Referencias externas.

## Herramientas disponibles (verificado 24 nov 2026)
- Node 24.16 · npm 11.13 · Git 2.53 · GitHub CLI 2.103 con sesión activa (permiso `repo`). Repositorio Git local inicializado; nada publicado en remoto.
- Descarga y análisis de la landing actual por terminal (la página es una SPA; el contenido se extrajo del bundle JS).
- **Sin navegador automatizado instalado todavía** → se instalará Playwright como dependencia de desarrollo para capturas, pruebas a 375 px y Lighthouse.
- Artifacts de claude.ai para prototipos visuales compartibles.

## Stack preliminar (se confirma en Fase 5)
**Astro + TypeScript + CSS propio (tokens) + GSAP (ScrollTrigger) cargado solo donde se usa.** Motivo: HTML estático con contenido real (SEO, LCP rápido), JS solo en las piezas interactivas («islas»), despliegue gratuito trivial en Vercel/Netlify/GitHub Pages. Sin Tailwind ni frameworks de UI para evitar el aspecto de plantilla y mantener el control de la marca.

## Riesgos, contradicciones y recursos faltantes
| # | Tema | Impacto | Propuesta |
|---|---|---|---|
| R1 | **Faltan los archivos oficiales del logo** (el manual cita `raw/Logo Principal Ai Academy.png` y la carpeta de logos recortados). La landing actual solo tiene el logo azul antiguo. El manual prohíbe redibujarlo. | Bloquea B-03 (y es criterio de descalificación) | Pedir: vertical principal a color, horizontal blanca y casco solo (PNG transparente o, idealmente, SVG). |
| R2 | **Fotos de personas reales**: el manual pide trainers y sesiones reales y prohíbe fotos de banco genéricas; el reto permite bancos libres. | Fidelidad a la marca | Preferible: fotos reales autorizadas de formaciones. Si no hay, usar un diseño que no dependa de fotos (tipográfico) y, como mucho, fotos libres de *trabajo real con pantallas*, no retratos genéricos. |
| R3 | **Max** (mascota) es CONFIRMADO, pero no tengo sus archivos. | Opcional | Si los hay (expresiones Analítico e Idea), se usan en FAQs y recomendador. |
| R4 | **Enlaces legales**: en la landing actual apuntan a `#`. | C-09 | Pedir URLs reales; si no existen, se mantiene el enlace marcado «por confirmar» (no se inventan páginas legales). |
| R5 | **Ignition dice «Conoce las 10 herramientas»**, la sección de herramientas lista 14. | Coherencia | Mantener el dato literal (no se cambian datos) y señalarlo al equipo. |
| R6 | **Reseñas**: sin fotos, fechas relativas fijas («hace 5 días») y sin evidencia de autorización (el manual pide autorización). | Credibilidad | Conservar texto, nombre y cargo; quitar las fechas relativas congeladas. |
| R7 | **Mensaje de WhatsApp** dice «Campuslands IA Academy». | Nombre | Corregir solo el texto del mensaje (mismo número). Requiere aprobación: el reto dice que los enlaces se mantienen. |
| R8 | **Diagnóstico** es en realidad un formulario de entrevista para asesores (pide «entrevistador» y «observaciones del asesor»). | Conversión | Se enlaza tal cual (lo exige el reto) pero se presenta como «Diagnóstico con un asesor», y WhatsApp como vía principal para empresas. |
| R9 | **El «hero con video» no tiene video**: es un casco animado. El reto pide conservar el mensaje y el botón, no un video. | Rendimiento | No se usará video (mejor LCP). |
| R10 | Cita de Darwin: atribución popular no verificada. | Voz de marca | Retirarla (el manual pide no vender humo y citar fuentes). |
| R11 | Fecha de entrega del reto desconocida. | Planificación | Confirmar. |

## Plan de trabajo
1. ✅ Fase 1 · Auditoría.
2. 🟨 Fases 2–3 · Estrategia + 3 direcciones → **elegir dirección** (tu decisión).
3. Fase 4 · Wireframes, sistema de diseño y prototipo del hero + recomendador (Artifact para validar).
4. Fase 5 · Andamiaje Astro, tokens, componentes base, Git.
5. Fase 6 · Secciones en orden de valor: hero → recomendador → misiones → exploración → recorrido → resto.
6. Fase 7 · QA con Playwright (375 px, teclado, movimiento reducido, consola) y Lighthouse móvil.
7. Fase 8 · Repositorio público + despliegue (con tu autorización) + autoevaluación con la rúbrica.

## Registro
Ver `docs/DECISIONS.md`.
