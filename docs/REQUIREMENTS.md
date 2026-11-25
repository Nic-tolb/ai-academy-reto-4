# Requisitos y matriz de cumplimiento

> Fuente: `1.Reto ingreso landing ai academy.pdf` (nov 2026). Revisión final: 24 nov 2026, sobre el sitio publicado.
> Estados: ✔️ cumple y está verificado · ⚠️ cumple con una salvedad · ❌ no cumple.
> «e2e» = `tests/e2e/landing.spec.ts`, que corre en cada push y también contra la URL publicada.

**Sitio:** https://nic-tolb.github.io/landing-ai-academy/ · **Repositorio:** https://github.com/Nic-tolb/landing-ai-academy

## A. Contenido que debe seguir comunicándose

| ID   | Requisito                                                                                                              | Estado | Evidencia                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 | Menú fijo: Beneficios, Herramientas, Planes, ¿Por qué ahora?, Casos de uso, FAQs, Diagnóstico, Certificado, Inscríbete | ✔️     | `Header.astro` (escritorio) y menú móvil con los nueve accesos                                                                                      |
| C-02 | «Evoluciona a la velocidad de la tecnología» + botón **Ver planes**                                                    | ✔️     | `Hero.astro`; e2e «hero»                                                                                                                            |
| C-03 | Beneficios: formación práctica, entregables listos, soporte continuo, rutas flexibles                                  | ✔️     | `Benefits.astro`, texto literal en `src/data/content.ts`                                                                                            |
| C-04 | Las 14 herramientas (nombres exactos)                                                                                  | ✔️     | `Tools.astro`; el título usa `TOOLS.length`; e2e «sin JavaScript» (HeyGen)                                                                          |
| C-05 | Cinco misiones con lo que incluye cada una                                                                             | ✔️     | `Missions.astro` desde `src/data/missions.ts`; e2e «presenta las cinco misiones»                                                                    |
| C-06 | ¿Por qué ahora?: el costo de esperar                                                                                   | ✔️     | `Urgency.astro` (fase T−7 · Carga útil)                                                                                                             |
| C-07 | Antes/después: empresario, director de innovación, independiente, líder de RR. HH.                                     | ✔️     | `Cases.astro`; e2e «exploración»                                                                                                                    |
| C-08 | Reseñas de equipos formados                                                                                            | ✔️     | `Reviews.astro` (texto literal; solo se corrigió el nombre de la marca)                                                                             |
| C-09 | FAQs, contacto por WhatsApp y enlaces legales                                                                          | ⚠️     | FAQs y WhatsApp ✔️. Los enlaces legales de la landing actual apuntan a `#`; se muestran como texto «pendiente de confirmar» en vez de enlaces rotos |
| C-10 | No cambiar datos: duraciones, nombres de planes, herramientas, enlaces                                                 | ✔️     | Fuente única `missions.ts`; Vitest comprueba que las razones del recomendador son viñetas literales                                                 |
| C-11 | Diagnóstico, Certificado e Inscripción enlazan a las páginas actuales                                                  | ✔️     | `src/data/links.ts`; e2e «enlaces reales» (todo enlace externo pertenece a la lista oficial)                                                        |

## B. Identidad visual

| ID   | Requisito                                                    | Estado | Evidencia                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B-01 | Solo la paleta oficial                                       | ✔️     | Auditoría del CSS/JS compilado: solo los 6 colores, sus transparencias y el tono de apoyo `#DCD6EA` del manual                                                                                      |
| B-02 | Poppins en todos sus pesos; ninguna otra familia             | ✔️     | Fontsource (400–800); el CSS compilado solo declara Poppins                                                                                                                                         |
| B-03 | Logo oficial, zona de protección, tamaño mínimo, sin efectos | ✔️     | Extraído del PDF con Python sin redibujar; e2e «marca» mide ancho mínimo y zona de protección                                                                                                       |
| B-04 | «Campuslands AI Academy»; corregir «IA Academy»              | ⚠️     | Todo el texto visible corregido (e2e «marca»). Queda «IA Academy» dentro del **mensaje prellenado de WhatsApp**, que no se cambió porque el reto pide mantener los enlaces (decisión pendiente, R7) |
| B-05 | Halos violeta, etiquetas en píldora, palabra en Soft Violet  | ✔️     | `Section.astro` (halos en esquinas), `.pill`, `<em>` en Soft Violet                                                                                                                                 |
| B-06 | Personas reales; sin robots genéricos ni fotos de banco      | ⚠️     | Sin robots ni fotos de banco. **No hay fotos de personas reales**: no se recibieron fotos autorizadas (R2); se usa Max, la mascota aprobada                                                         |
| B-07 | Narrativa espacial como hilo conductor                       | ✔️     | Cuenta regresiva T−8 → T−0, etapas que se apilan, trayectoria del hero; e2e «cuenta regresiva»                                                                                                      |

## C. Interactividad

| ID   | Pieza mínima                      | Estado | Evidencia                                                                                                               |
| ---- | --------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| I-01 | Hero que reacciona al visitante   | ✔️     | Canvas que responde a cursor, dedo y scroll + elección de perfil con ficha de misión en la primera pantalla; e2e «hero» |
| I-02 | Recorrido narrativo con el scroll | ✔️     | Riel / barra de fases T−8 → T−0, revelado con GSAP, etapas que se apilan; e2e «recorrido»                               |
| I-03 | Recomendador de planes            | ✔️     | Hasta 3 preguntas → misión, razones literales, alternativa y CTA real; Vitest + e2e «recomendador»                      |
| I-04 | Exploración libre                 | ✔️     | Antes/después con barrido y gesto + constelación de 14 herramientas filtrable; e2e «exploración»                        |
| I-05 | Microinteracciones                | ✔️     | Estados hover, foco, activo y de selección en botones, píldoras, pestañas y tarjetas                                    |

## D. Conversión

| ID   | Requisito                                             | Estado | Evidencia                                                                                             |
| ---- | ----------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| V-01 | Inscripción y WhatsApp siempre a mano sin interrumpir | ✔️     | Encabezado en escritorio; barra inferior en móvil que se oculta en el hero, el menú y el recomendador |
| V-02 | Enlaces reales de la landing actual                   | ✔️     | e2e «enlaces reales»                                                                                  |

## E. Técnicos

| ID   | Requisito                              | Meta                    | Estado | Evidencia (sitio publicado)                                                                                             |
| ---- | -------------------------------------- | ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| T-01 | Experiencia completa a 375 px y táctil | Todo funciona en 375 px | ✔️     | e2e corre completo en 375 px con pantalla táctil; 0 px de desbordamiento                                                |
| T-02 | Lighthouse móvil Performance           | ≥ 80                    | ✔️     | **100** en 3 corridas (Lighthouse 12.3); CI falla si baja de 80                                                         |
| T-03 | Imágenes comprimidas, carga diferida   | —                       | ✔️     | WebP responsivo (logo 83 kB → 3 kB); `loading="lazy"` fuera del primer pantallazo; GSAP y canvas en diferido; sin video |
| T-04 | Contraste suficiente                   | WCAG 2.1 AA             | ✔️     | axe-core sin infracciones graves; Lighthouse Accesibilidad 100                                                          |
| T-05 | Navegación con teclado                 | —                       | ✔️     | «Saltar al contenido», foco visible, pestañas con flechas; e2e «teclado»                                                |
| T-06 | `prefers-reduced-motion`               | —                       | ✔️     | Sin animaciones, hero fijo que sigue respondiendo; e2e «movimiento reducido»                                            |
| T-07 | Sin errores en consola                 | 0                       | ✔️     | e2e «estabilidad» en local y en línea                                                                                   |
| T-08 | Publicado en servicio gratuito         | URL pública             | ✔️     | GitHub Pages con HTTPS, publicado por GitHub Actions                                                                    |
| T-09 | Repositorio público + README           | —                       | ✔️     | README con cómo correrlo, stack, estructura y uso de IA                                                                 |

## F. Reglas

| ID   | Regla                                                    | Estado | Evidencia                                                  |
| ---- | -------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| R-01 | Sin plantillas compradas ni temas prearmados             | ✔️     | Componentes propios; solo librerías abiertas (Astro, GSAP) |
| R-02 | Logo y recursos del manual                               | ✔️     | Logos y Max extraídos del PDF oficial                      |
| R-03 | Uso de IA permitido y declarado                          | ✔️     | README, sección «Uso de IA»                                |
| —    | Fuera de evaluación si: no carga / sin repo / sin manual | ✔️     | Carga (HTTP 200), repo público, manual aplicado            |
