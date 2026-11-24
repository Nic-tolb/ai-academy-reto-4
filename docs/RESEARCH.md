# Investigación y auditoría — Fase 1

> Estado: **completado** · 24 nov 2026
> Fuente: `https://campuslands.aiacademy.com.co/` (bundle `assets/index-DSwt9kXJ.js`, descargado y analizado el 24 nov 2026).
> Leyenda: **[H]** hecho verificado en la fuente · **[I]** interpretación propia.

## 1. Cómo está construida la landing actual

| Aspecto | Hallazgo |
|---|---|
| Stack [H] | SPA en React + React Router + Tailwind + GSAP 3.13 (ScrollTrigger, ScrollTo) + Framer Motion + lucide. Bundle único de **647 KB** de JS. HTML vacío (`<div id="root">`): sin contenido para buscadores ni lectores antes de ejecutar JS. |
| `<html lang>` [H] | `lang="en"` en un sitio en español. `<title> IA ACADEMY</title>`. |
| Hero [H] | **No hay video**. El "hero con video" es una sección fija con el casco (`/casco_azul.svg`) y el texto `/Text-campus.svg`. Con el scroll, el casco gira 360°, se amplía ×6 y da paso a la sección `#video`: cita de Darwin con efecto de máquina de escribir + «Evoluciona a la velocidad de la tecnología.» + botón **Ver planes** (`#planes`). Ocupa **3,5 alturas de pantalla** de scroll bloqueado. |
| Scroll [H] | Al cargar, el sitio **bloquea el scroll** durante un instante y fuerza volver arriba (`scrollRestoration = manual`, `preventDefault` en wheel/touchmove). |
| Marca [H] | Paleta sky/cyan/emerald/amber/indigo (Tailwind) — **ninguna** es de la nueva paleta. Logo azul antiguo. |
| Rutas [H] | `/inscripcion`, `/:formationSlug` (inscripción con formación preseleccionada), `/diagnostico`, `/certificado`, `/low-code`, `/planes`, `/beneficios`, `/herramientas`, `/faqs`, `/nebula` (redirige a `/`). |

### Orden actual de secciones [H]
Menú (aparece tras 1 pantalla de scroll) → Hero casco → Cita Darwin + «Evoluciona…» → Beneficios → Herramientas → Planes → ¿Por qué ahora? → Casos de uso (antes/después) → Reseñas → FAQs → Footer.

## 2. Inventario de contenido (literal)

### 2.1 Menú [H]
Beneficios (`#beneficios`) · Herramientas (`#herramientas`) · Planes (`#planes`) · ¿Por qué ahora? (`#urgencia`) · Casos de uso (`#casos-uso`) · FAQs (`#faqs`) · Diagnostico (→ `/diagnostico`) · Certificado (→ `/certificado`) · botón **Inscríbete** (→ `/inscripcion`).

### 2.2 Enlaces reales de conversión [H]
| Uso | URL |
|---|---|
| Inscripción (menú y **todos** los botones de plan, incluido Nebula) | `https://campuslands.aiacademy.com.co/inscripcion` |
| Diagnóstico | `https://campuslands.aiacademy.com.co/diagnostico` |
| Certificado | `https://campuslands.aiacademy.com.co/certificado` |
| WhatsApp | `https://wa.me/573052105674?text=Hola%2C%20quiero%20informaci%C3%B3n%20del%20curso%20de%20IA%20de%20Campuslands%20IA%20Academy` |
| Política de privacidad / Términos | `href="#"` — **no existen URLs reales** |

### 2.3 Hero [H]
- Cita: «No es la especie más fuerte ni la más inteligente la que sobrevive, sino la que mejor se adapta a los cambios.» — Charles Darwin *(atribución popular, no textual de Darwin [I])*.
- Titular: «Evoluciona a la velocidad de la tecnología.» · Botón: «Ver planes».

### 2.4 Beneficios — «¿Por qué elegir Campuslands IA Academy?» [H]
1. **Formación Práctica** — Sesiones personalizadas de 4h, 8h y 12h con casos reales para tu negocio.
2. **Entregables Listos** — Banco de prompts, guías operativas y agentes base adaptados a tu industria.
3. **Soporte Continuo** — Comunidad privada de WhatsApp y soporte posventa para resolver dudas.
4. **Rutas Flexibles** — Cursos en presenciales y virtuales por niveles con resultados medibles.

### 2.5 Herramientas (14) [H]
| # | Herramienta | Tagline actual |
|---|---|---|
| 1 | ChatGPT | Asistente conversacional para ideas y código |
| 2 | Make | Orquestación visual de procesos |
| 3 | Gemini | Visión multimodal impulsada por Google |
| 4 | Claude | IA colaborativa con atención al detalle |
| 5 | Microsoft Copilot | Asistencia integrada en el ecosistema Microsoft |
| 6 | GitHub Copilot | Colaborador de código en tiempo real |
| 7 | Midjourney | Diseño visual impulsado por prompts |
| 8 | Notion AI | Organización y contenido en un solo espacio |
| 9 | Zapier | Automatización con inteligencia contextual |
| 10 | Perplexity | Investigación asistida por IA |
| 11 | NotebookLM | Tu asistente de investigación personalizado |
| 12 | Read AI | Resúmenes y análisis inteligentes para reuniones |
| 13 | ElevenLabs | Voces sintéticas realistas y clonación de voz |
| 14 | HeyGen | Creación de avatares y videos con IA |

Cada una tiene además una descripción y 3 «highlights» (en el bundle). Nota: **n8n** se enseña en Liftoff pero no está en la lista de 14.

### 2.6 Planes — «Planes de Formación Espacial» [H]
| Misión | Etiqueta | Duración | Incluye | CTA |
|---|---|---|---|---|
| **IGNITION** | Fase 01 | 4 horas | Comprende el impacto real de la IA en tu industria · Domina la IA generativa de tu elección como asistente diario · Conoce las 10 herramientas de IA más relevantes · Aprende a crear agentes básicos de IA en vivo | Inscribete ahora |
| **BOOSTER** | Fase 02 | 8 horas | Todo Ignition con enfoque profesional avanzado · Técnicas de prompting para resultados precisos · Domina 2 herramientas de IA a tu elección · Construye agentes personalizados para tu rol | Inscribete ahora |
| **LIFTOFF** | Fase 03 | 12 horas | Todo Booster enfocado en escalar tu operación · Domina una herramienta de IA adicional elegida · Aprende a automatizar procesos reales con n8n · Diseña flujos automáticos aplicados a tu negocio | Inscribete ahora |
| **ODYSSEY** | Expedición | Personalizado | Programa 100% personalizado para tu empresa · Elige herramientas, duración y profundidad · Casos de uso reales según tu industria y roles · Acompañamiento estratégico con sesiones tácticas | Inscribete ahora |
| **NEBULA** | Órbita | Pregrabado | Contenidos organizados por niveles de aprendizaje · Evaluaciones continuas para medir el progreso · Acceso flexible 24/7 a materiales, recursos y actualizaciones · Comunidad activa de soporte y aprendizaje colaborativo | Accede Ahora |

Sin precios publicados. Subtítulo: «Elige el plan que mejor impulse tu misión hacia la Inteligencia Artificial».

### 2.7 ¿Por qué ahora? — «Cada semana sin IA aplicada cuesta velocidad y competitividad» [H]
1. **La IA ya es estándar operativo** — Las empresas líderes integran IA en procesos diarios; cada semana de espera amplía la brecha competitiva.
2. **El costo de esperar se acumula** — Más horas manuales y más retrabajo frente a competidores que automatizan desde hoy.
3. **Tu talento quiere crear, no repetir** — Los equipos buscan herramientas que liberen tiempo para tareas estratégicas; si no se las das, las buscarán fuera.
4. **Efecto compuesto del aprendizaje** — Cada día sin práctica resta valor acumulado en prompts, agentes y casos listos para escalar.

Sin cifras ni fuentes (bien: el manual exige «cifras con su fuente»).

### 2.8 Casos de uso — «antes / después» [H]
Intro: «Visualiza el salto concreto que tu equipo puede lograr al aplicar IA en su contexto operativo.»
| Perfil | Antes | Después |
|---|---|---|
| Empresario / Emprendedor | Procesos comerciales manuales, lanzamientos lentos y decisiones a ciegas por falta de contenido y reportes actualizados. | Asistentes de IA que crean emails, propuestas y reportes en minutos, con métricas claras para escalar ventas sin fricción. |
| Director(a) de Innovación | Pilotos desconectados que no escalan y escasa evidencia para justificar inversión ante la dirección. | Workshops intensivos de 4h con agentes funcionales, casos de uso claros y métricas de eficiencia listas para presentar. |
| Profesional Independiente | Demasiado tiempo en tareas repetitivas, poco foco en vender y mínima diferenciación frente al mercado. | Prompts estratégicos que generan propuestas, automatizan el seguimiento y entregan resultados personalizados en segundos. |
| Líder de RR.HH. | Onboarding genérico, procesos manuales y nulo acompañamiento adaptado a cada rol. | Rutas de microlearning con bots que guían, responden dudas y capturan feedback continuo de forma automática. |

### 2.9 Reseñas — «Historias reales de equipos que ya despegaron con IA Academy» [H]
| Nombre | Cargo | Texto | Fecha |
|---|---|---|---|
| Laura Gómez | Tech Lead en InnovApp | IA Academy nos dio herramientas concretas para acelerar nuestros procesos. El enfoque práctico nos permitió aplicar lo aprendido desde el primer día. | Hace 2 semanas |
| Carlos Herrera | Director de Talento, Grupo Andino | La formación de 8 horas fue ideal para nuestro equipo. Los casos por industria marcaron la diferencia y resolvieron dudas específicas. | Hace 1 mes |
| Juliana Restrepo | Fundadora de CrecePyme | Más que un curso, fue una experiencia de estrategia digital. Las automatizaciones de seguimiento nos ahorran horas cada semana. | Hace 3 semanas |
| Miguel Ángel López | Profesor universitario | Excelente acompañamiento. Adaptaron el contenido a educación superior y nos dejaron material listo para incorporar en clase. | Hace 5 días |

Sin fotos. Fechas relativas fijas en el código (siempre dirán «hace 5 días»).

### 2.10 FAQs — «Resolvemos tus dudas sobre IA Academy» [H]
1. **¿Qué modalidades de formación ofrecen?** Ofrecemos formación presencial en nuestras instalaciones de Campuslands, presencial en las instalaciones del cliente, y modalidad virtual. Todas las modalidades mantienen la misma calidad y contenido.
2. **¿Cómo se eligen las fechas de los cursos?** El estudiante individual puede elegir la fecha que mejor le convenga. Para empresas, coordinamos las fechas a través de WhatsApp para encontrar el momento ideal para todo el equipo.
3. **¿Necesito conocimientos previos en IA?** No son obligatorios conocimientos previos. Nuestros cursos están diseñados desde el 'despertar digital' hasta niveles avanzados, adaptándose al nivel de cada participante.
4. **¿Qué tipo de certificación recibo?** Recibes una certificación oficial por las horas cursadas, que valida tu conocimiento en las herramientas de IA específicas que hayas aprendido durante la formación.
5. **¿Qué materiales están incluidos?** Todos los cursos incluyen un banco de prompts especializado. Los cursos de 8h y 12h incluyen además agentes personalizados y automatizaciones acordadas según las necesidades específicas.
6. **¿Cómo funcionan los pagos?** Próximamente implementaremos pagos a través de Wompi en nuestra página de precios. Mientras tanto, puedes contactarnos por WhatsApp para coordinar el pago.

### 2.11 Footer [H]
Logo · «Transformamos la productividad de los equipos con una adopción de IA práctica, guiada y amigable.» · Navegación · Contacto: WhatsApp «Habla con un especialista» · «© {año} Campuslands IA Academy. Todos los derechos reservados.» · Política de privacidad (`#`) · Términos (`#`).
El certificado se expide en «Floridablanca, Santander», firmado por Diego Tarazona, Director General.

### 2.12 Menciones incorrectas de «IA Academy» [H] — corregir a «Campuslands AI Academy» / «AI Academy»
`<title>`, título de Beneficios, título de FAQs, título de Reseñas, testimonio de Laura Gómez, footer (2 veces), alt «Campus IA Logo», mensaje prellenado de WhatsApp.

## 3. Diagnóstico de la experiencia actual [I]

**Fortalezas**
- Contenido comercial completo y bien estructurado; la narrativa espacial ya existe en los nombres (Fase 01/02/03, Expedición, Órbita).
- Casos de uso con antes/después: buena base para una pieza de exploración.
- Respeta `prefers-reduced-motion` en algunas animaciones.

**Problemas**
1. **Marca**: paleta, logo y nombre fuera del manual nuevo.
2. **Primer impacto lento**: 3,5 pantallas de scroll fijado antes de ver el mensaje; el visitante de un anuncio no sabe qué se ofrece hasta muy tarde. Bloqueo de scroll al cargar.
3. **Sin personalización**: empresa, líder y persona independiente ven lo mismo; los planes no dicen *para quién* es cada uno.
4. **El espacio es decoración**: «Fase 01» o «Órbita» son etiquetas; no hay progresión ni relación entre misiones.
5. **Planes difíciles de comparar**: carrusel horizontal; sin ayuda para elegir.
6. **CTA**: todos los planes llevan al mismo formulario genérico; WhatsApp solo al final.
7. **Técnica**: 647 KB de JS para una página informativa, HTML vacío (mal SEO, LCP tardío), `lang="en"`, enlaces legales rotos.
8. **Credibilidad**: reseñas sin foto, con fechas relativas congeladas; cita de Darwin de atribución dudosa; «10 herramientas» en Ignition y 14 en la sección de herramientas.

## 4. Referencias y patrones analizados [I]

No se copia ningún diseño; se extraen principios.

| Patrón | Dónde funciona | Qué tomamos |
|---|---|---|
| Elección temprana del perfil | Onboardings de productos SaaS B2B, cursos con rutas | Una pregunta en el hero personaliza textos y recomendaciones; reduce la carga cognitiva. |
| Scroll como línea de tiempo con indicador persistente | Reportajes interactivos de prensa (formato *scrollytelling*) | Un indicador de progreso con significado (fases de la misión), no una barra genérica. |
| Configurador con resultado explicado | Comparadores de planes de telecomunicaciones, configuradores de productos | 3 preguntas → resultado con el *porqué* y un CTA directo. |
| Antes/después con control deslizante | Herramientas de edición de fotos, casos de estudio | Demostrar el cambio con contenido real del caso, no con fotos. |
| Demo de prompt en vivo | Páginas de producto de asistentes de IA | Mostrar una tarea real que se transforma; refuerza «Te explicamos lo complejo de forma simple». |
| Tipografía como protagonista | Sitios editoriales con fuentes grandes y poca imagen | Con una sola familia (Poppins), la jerarquía se construye con peso y escala; evita parecer plantilla SaaS. |

## 5. Lo que el manual pide y la landing debe reflejar [H → I]
- Audiencias: empresas y líderes (abrir con un problema de trabajo), equipos (tarea repetitiva), principiantes (resultado concreto), perfiles técnicos (demostración).
- Público real: 63 % de 25–44 años, 60 % en Bucaramanga → ejemplos de Santander.
- Voz: «Primero el ejercicio; al final, la invitación». Evitar «revolucionario», «el futuro ya llegó».
- Max (mascota) puede acompañar FAQs y respuestas, con sus 4 expresiones aprobadas (Analítico para preguntas/comparaciones, Idea para la solución).
