# Requisitos y matriz de cumplimiento

> Fuente principal: `1.Reto ingreso landing ai academy.pdf` (nov 2026).
> Estados: ⬜ pendiente · 🟨 en curso · ✅ implementado · ✔️ verificado (con evidencia en `QA_REPORT.md`).

## A. Contenido que debe seguir comunicándose
| ID | Requisito | Fuente de datos | Estado |
|---|---|---|---|
| C-01 | Menú fijo con acceso a Beneficios, Herramientas, Planes, ¿Por qué ahora?, Casos de uso, FAQs, Diagnóstico, Certificado e Inscríbete | RESEARCH §2.1 | ⬜ |
| C-02 | Mensaje «Evoluciona a la velocidad de la tecnología» + botón **Ver planes** | RESEARCH §2.3 | ⬜ |
| C-03 | Beneficios: formación práctica, entregables listos, soporte continuo, rutas flexibles | RESEARCH §2.4 | ⬜ |
| C-04 | Las 14 herramientas (nombres exactos) | RESEARCH §2.5 | ⬜ |
| C-05 | Cinco misiones con lo que incluye cada una: Ignition 4 h, Booster 8 h, Liftoff 12 h, Odyssey personalizado, Nebula pregrabado | RESEARCH §2.6 | ⬜ |
| C-06 | ¿Por qué ahora?: el costo de esperar | RESEARCH §2.7 | ⬜ |
| C-07 | Casos de uso: antes/después de empresario, director de innovación, profesional independiente y líder de RR. HH. | RESEARCH §2.8 | ⬜ |
| C-08 | Reseñas de equipos formados | RESEARCH §2.9 | ⬜ |
| C-09 | FAQs (modalidades, fechas, requisitos…), contacto por WhatsApp, enlaces legales | RESEARCH §2.10–2.11 | ⬜ |
| C-10 | No cambiar datos: duraciones, nombres de planes, herramientas, enlaces de inscripción y WhatsApp | — | ⬜ |
| C-11 | Diagnóstico, Certificado e Inscripción enlazan a las páginas actuales | RESEARCH §2.2 | ⬜ |

## B. Identidad visual
| ID | Requisito | Estado |
|---|---|---|
| B-01 | Paleta exacta: #050507 · #7026E8 · #9636FF · #B783FF · #FFFFFF · #8E8998 (y solo esa) | ⬜ |
| B-02 | Poppins en todos sus pesos; ninguna otra familia | ⬜ |
| B-03 | Logo oficial «campuslands AI» desde archivo original, zona de protección, tamaño mínimo, sin efectos | ⬜ (**bloqueado: faltan archivos**) |
| B-04 | Nombre «Campuslands AI Academy»; corregir todas las menciones «IA Academy» | ⬜ |
| B-05 | Halos violeta, etiquetas en píldora, palabra destacada en Soft Violet | ⬜ |
| B-06 | Personas reales; sin robots genéricos ni fotos de banco | ⬜ |
| B-07 | Narrativa espacial como hilo conductor, no como decoración | ⬜ |

## C. Interactividad (35 pts)
| ID | Pieza mínima | Criterio de aceptación | Estado |
|---|---|---|---|
| I-01 | Hero que reacciona al visitante | Responde a una acción (elección/cursor/scroll) con equivalente táctil y de teclado; el mensaje y «Ver planes» visibles sin scroll | ⬜ |
| I-02 | Recorrido narrativo con el scroll | Animaciones ligadas al scroll + secciones que se revelan + indicador de progreso del viaje; sin secuestrar el scroll | ⬜ |
| I-03 | Recomendador de planes | 2–3 preguntas → misión sugerida, justificada solo con datos reales, con CTA directo | ⬜ |
| I-04 | Exploración libre | Constelación de herramientas / antes-después deslizable / demo de prompt; usable con toque y teclado | ⬜ |
| I-05 | Microinteracciones | Hover, foco visible, respuesta al clic y transiciones en todos los controles | ⬜ |

## D. Conversión
| ID | Requisito | Estado |
|---|---|---|
| V-01 | Inscripción y WhatsApp siempre a mano sin interrumpir la exploración | ⬜ |
| V-02 | Enlaces reales de la landing actual | ⬜ |

## E. Técnicos
| ID | Requisito | Meta medible | Estado |
|---|---|---|---|
| T-01 | Experiencia completa a 375 px, interacciones táctiles equivalentes | Revisión en 375×812 | ⬜ |
| T-02 | Rendimiento | Lighthouse móvil Performance ≥ 80 (objetivo interno ≥ 90) | ⬜ |
| T-03 | Imágenes/video comprimidos, carga diferida | AVIF/WebP, `loading="lazy"` fuera del primer pantallazo | ⬜ |
| T-04 | Contraste suficiente | Todo texto ≥ 4,5:1 (grande ≥ 3:1) | ⬜ |
| T-05 | Navegación con teclado | Todo operable con Tab/Enter/Espacio/flechas; foco visible; enlace «Saltar al contenido» | ⬜ |
| T-06 | `prefers-reduced-motion` | Animaciones reducidas a fundidos o desactivadas | ⬜ |
| T-07 | Sin errores en consola | 0 errores | ⬜ |
| T-08 | Publicado en servicio gratuito | URL pública | ⬜ |
| T-09 | Repositorio público en GitHub + README claro | URL pública | ⬜ |

## F. Reglas
| ID | Regla | Estado |
|---|---|---|
| R-01 | Sin plantillas compradas ni temas prearmados (librerías abiertas sí) | ⬜ |
| R-02 | Imágenes: logo y recursos del manual; fotos de personas de bancos libres si hacen falta | ⬜ |
| R-03 | Uso de IA permitido y declarado (README) | ⬜ |

## G. Rúbrica oficial
| Criterio | Peso |
|---|---|
| Experiencia interactiva | 35 |
| Fidelidad a la marca | 20 |
| Diseño visual y jerarquía | 15 |
| Calidad técnica | 20 |
| Móvil y accesibilidad | 10 |

**Descalificación**: sitio que no carga, sin repositorio o sin manual de marca.
