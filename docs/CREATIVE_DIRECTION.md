# Dirección creativa — Fase 3

> Estado: **PROPUESTAS — pendiente de aprobación.** No se implementa nada hasta elegir una.

Restricciones comunes a las tres: paleta y Poppins del manual, logo intacto (no se anima), halos solo en esquinas y nunca detrás del texto, sin robots ni fotos de banco genéricas, misma estrategia de CTA (UX_STRATEGY §4).

---

## A · «Plan de vuelo»  ⭐ recomendada

**Idea central.** La página es el plan de vuelo de *tu* misión. El visitante no lee una landing: prepara un despegue. Cada sección es una fase con un nombre técnico real de un lanzamiento (Cuenta regresiva → Ignición → Ascenso → Separación de etapas → Órbita), y cada fase corresponde a un paso de la decisión de compra.

**Narrativa.** «T−10: identifica la tripulación» (hero: ¿quién eres?) → «T−5: carga útil» (qué tareas te pesan) → «T−0: ignición» (antes/después) → «Ascenso: instrumentos» (herramientas) → «Separación de etapas» (las misiones como etapas de un cohete: Ignition, Booster y Liftoff se **apilan** literalmente porque cada una incluye la anterior; Odyssey y Nebula son trayectorias aparte) → «Órbita» (reseñas, FAQs) → despegue (CTA).

**Dirección artística.** Editorial y tipográfica. Negro dominante, Poppins 800 a gran escala, números de fase como elementos gráficos, líneas finas de trayectoria en Soft Violet al 30 %, halos en las esquinas. Casi sin ilustración: el espacio se siente por **la composición y el movimiento**, no por planetas. Es lo opuesto a una plantilla SaaS: pocas tarjetas, grandes bloques tipográficos, una línea de trayectoria que une todo.

**Hero.** Titular «Evoluciona a la **velocidad** de la tecnología.» + pregunta «¿Quién va en esta misión?» con 3 botones (Empresa · Líder de equipo · Independiente). Al elegir: la trayectoria de la página se «calcula» (una línea se dibuja hacia abajo), el subtítulo y el CTA se reescriben para ese perfil y el recomendador queda pre-respondido. Además, el halo sigue sutilmente al cursor o a la inclinación del dedo (efecto mínimo, desactivado con movimiento reducido). «Ver planes» siempre visible.

**Scroll.** Un **altímetro** lateral (escritorio) / barra superior segmentada (móvil) con las fases; muestra dónde estás y permite saltar. La línea de trayectoria se dibuja con el scroll (SVG `stroke-dashoffset`). Secciones que se revelan; en «Separación de etapas» las tres misiones en vivo se apilan y desacoplan mientras bajas (fijado corto, ≤ 1,2 pantallas, solo escritorio; en móvil es un apilado animado normal).

**Recomendador — «Configura tu misión».** Tres preguntas, cada una mapeada a datos reales:
1. ¿Cómo prefieres aprender? → *En vivo con un trainer* / *A mi ritmo, cuando pueda* (→ **Nebula**: pregrabado, acceso 24/7).
2. ¿Quién se forma? → *Solo yo* / *Mi equipo* / *Mi empresa, con necesidades propias* (→ **Odyssey**: 100 % personalizado, eliges herramientas, duración y profundidad).
3. ¿Hasta dónde quieres llegar? → *Usar la IA a diario y entender su impacto* (→ **Ignition**, 4 h) / *Prompts precisos y agentes para mi rol* (→ **Booster**, 8 h) / *Automatizar procesos con n8n* (→ **Liftoff**, 12 h).
El resultado muestra la misión, su duración, **por qué** (las viñetas reales que coinciden con tus respuestas) y la alternativa más cercana. CTA: Inscribirme (o WhatsApp para Odyssey). Mientras respondes, la etapa correspondiente del cohete se ilumina.

**Exploración libre — «Banco de pruebas».** Elige una tarea real de un perfil (p. ej. «Responder 40 cotizaciones de una ferretería en Bucaramanga») y mira una **demo corta de prompt en acción**: el prompt se escribe, la respuesta aparece y un contador muestra el paso de *antes* a *después*. Cada demo indica qué herramienta de las 14 se usa y en qué misión se aprende. Contenido marcado como «ejemplo simulado» (lo exige el manual). Complemento: las 14 herramientas como **constelación** filtrable por objetivo (escribir, investigar, automatizar, crear audio/video).

**Ventajas.** Une las cuatro piezas en una sola historia (la elección del hero alimenta el recomendador; la demo enlaza con la misión). Respeta el manual al pie de la letra sin parecer rígido. Rinde muy bien en móvil (casi todo es tipografía y SVG). Bajo riesgo de rendimiento.
**Riesgos.** Si la tipografía no está muy bien resuelta, puede verse sobrio en exceso → se compensa con el movimiento de la trayectoria y la demo. El léxico de lanzamiento (T−10) debe ser comprensible: siempre acompañado de un título claro.
**Complejidad técnica.** Media. **Móvil.** Excelente.

---

## B · «Órbitas»

**Idea central.** La academia es un sistema orbital con el casco al centro. Cada misión es una órbita más amplia (4 h → 8 h → 12 h: más lejos = más profundidad); Odyssey es una trayectoria a medida y Nebula una nube que se recorre libremente. Bajar por la página es alejarse del centro.

**Dirección artística.** Ilustrativa y geométrica: círculos concéntricos finos, nodos, puntos que orbitan; profundidad con capas en paralaje. Más «espacial» visualmente.

**Hero.** El casco (archivo oficial, sin alterar) en el centro y órbitas que reaccionan al cursor/giroscopio. Al elegir perfil, se ilumina la órbita sugerida.
**Scroll.** Zoom-out progresivo del sistema; las secciones se acoplan a cada órbita.
**Recomendador.** Las respuestas mueven un satélite hasta la órbita adecuada.
**Exploración.** Las 14 herramientas orbitando; al tocar una, se abre su ficha y la misión donde se aprende.

**Ventajas.** Muy memorable y visual; la metáfora «más lejos = más horas» es clara.
**Riesgos.** El brief pide no caer en planetas y estrellas: es la opción más cercana a eso. En 375 px las órbitas se vuelven pequeñas; la constelación orbital es difícil de usar con el dedo y con teclado. Mayor riesgo de rendimiento (muchas capas animadas). Riesgo de usar el casco de forma «decorativa», cercano a lo que prohíbe el manual.
**Complejidad.** Alta. **Móvil.** Regular.

---

## C · «Gravedad cero»

**Idea central.** La narrativa espacial se expresa como **peso**. Las tareas repetitivas tienen gravedad: en la página aparecen como bloques pesados que caen y se apilan («copiar lo mismo en cinco correos», «armar el reporte del lunes»). La IA aplicada los libera: al aplicar la herramienta correcta, flotan y se ordenan. Se basa en una jornada real: lunes 8:00 a. m. en una empresa de Santander.

**Dirección artística.** Física y táctil: bloques tipográficos que caen, se arrastran y flotan. Max podría aparecer con su expresión «Cansado, pero listo» al inicio e «Idea» al final.

**Hero.** Los bloques de tareas caen al cargar; el cursor/dedo puede empujarlos. Elegir perfil cambia qué tareas caen.
**Scroll.** Avanza el reloj de la jornada (8:00 → 18:00); cada hora resuelve una tarea.
**Recomendador.** «¿Cuánto pesa tu semana?»: arrastras tareas a una balanza; según el peso y el tipo se sugiere la misión.
**Exploración.** Arrastrar una tarea sobre una herramienta y ver el antes/después.

**Ventajas.** La más original; conecta con el manual («¿Te ha pasado que copias lo mismo en cinco correos?»). Muy memorable.
**Riesgos.** El arrastre es difícil de hacer accesible con teclado y lector de pantalla; la física consume CPU en móviles de gama media; la metáfora espacial queda en segundo plano (el brief pide que sea el hilo conductor). La balanza requiere inventar «pesos» que no están en los datos de las misiones.
**Complejidad.** Alta. **Móvil.** Regular.

---

## Evaluación con la rúbrica oficial (estimación previa)

| Criterio (peso) | A · Plan de vuelo | B · Órbitas | C · Gravedad cero |
|---|---|---|---|
| Experiencia interactiva (35) | 30 — piezas encadenadas | 28 — vistosa, menos clara | 31 — muy original, riesgo táctil |
| Fidelidad a la marca (20) | 19 | 15 — riesgo de decoración espacial | 17 — espacio secundario |
| Diseño visual y jerarquía (15) | 13 | 12 | 12 |
| Calidad técnica (20) | 18 | 14 | 14 |
| Móvil y accesibilidad (10) | 9 | 6 | 6 |
| **Total estimado** | **89** | **75** | **80** |

**Recomendación: A · Plan de vuelo**, tomando de C la demo «antes/después» de tareas reales de Santander como pieza de exploración. Es la que mejor convierte la narrativa espacial en estructura (fases, etapas que se apilan) en lugar de decoración, la que más protege móvil, accesibilidad y rendimiento (30 de 100 puntos), y la única en que las cuatro piezas obligatorias forman una sola historia.

## Siguiente paso tras la aprobación
Fase 4: wireframes móvil y escritorio de las 9 secciones, sistema de diseño (tokens, escala, componentes) y un prototipo navegable del hero + recomendador para validar antes de construir el resto.
