# Interacciones — especificación

> Estado: **implementado** y cubierto por `tests/e2e/landing.spec.ts` (I-01 a I-04).
> Cada pieza responde: ¿qué aporta? · ¿por qué interesa? · ¿cómo acerca a la conversión?

## I-01 · Hero «¿Quién va en esta misión?»

- **Qué aporta**: en un toque, la página habla el idioma del visitante.
- **Por qué interesa**: es una pregunta sobre la persona, no sobre el producto; la respuesta cambia algo visible al instante.
- **Conversión**: adapta el CTA (Empresa → «Hablar con un especialista» por WhatsApp; Líder/Independiente → «Inscríbete») y deja respondido el recomendador.

Comportamiento

1. Tres botones con `aria-pressed`: Empresa · Líder de equipo · Independiente. Ninguno es obligatorio: «Ver planes» funciona sin elegir.
2. Al elegir: el subtítulo se reescribe con datos reales de la misión más cercana; el punto de la trayectoria viaja hasta esa etapa (Independiente → Ignition, Líder → Booster, Empresa → bifurcación Odyssey).
3. Cursor / dedo: la trayectoria se desplaza ±8 px con el puntero (paralaje). Con movimiento reducido no hay paralaje y el punto salta sin animación.
4. Teclado: Tab entre opciones, Enter/Espacio para elegir. El cambio de subtítulo se anuncia con `aria-live="polite"`.

Mensajes por perfil (solo datos reales)

| Perfil          | Subtítulo                                                                                                                                               | CTA principal              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| — (inicial)     | Formación práctica en IA para empresas, equipos y profesionales: aprendes con tus tareas reales y sales con prompts, agentes y automatizaciones listos. | Ver planes                 |
| Empresa         | Diseñamos el programa contigo: eliges herramientas, duración y profundidad, con casos reales de tu industria.                                           | Hablar con un especialista |
| Líder de equipo | En 8 horas tu equipo aprende prompting preciso y construye agentes personalizados para su rol.                                                          | Inscríbete                 |
| Independiente   | Empieza con 4 horas en vivo o a tu ritmo con contenido pregrabado, y usa la IA como asistente diario.                                                   | Inscríbete                 |

## I-02 · Recorrido narrativo («Plan de vuelo»)

Cuenta regresiva real: un paso por fase, de T−8 a T−0. El despegue (T−0) es la inscripción; toda la página prepara ese momento.

| Fase | Código | Sección                                                                 |
| ---- | ------ | ----------------------------------------------------------------------- |
| 0    | T−8    | Tripulación (hero)                                                      |
| 1    | T−7    | Carga útil — ¿Por qué ahora?                                            |
| 2    | T−6    | Ensayo — Antes / después                                                |
| 3    | T−5    | Instrumentos — 14 herramientas                                          |
| 4    | T−4    | Sistemas — Beneficios                                                   |
| 5    | T−3    | Etapas — Misiones + recomendador                                        |
| 6    | T−2    | Bitácora — Reseñas                                                      |
| 7    | T−1    | Control de misión — FAQs, Diagnóstico, Certificado (verificación final) |
| 8    | T−0    | Despegue — CTA final                                                    |

La línea del riel se llena hasta la fase activa (no según el porcentaje de scroll), para que siempre coincida con un marcador.

- **Riel de fases**: en escritorio, riel vertical a la izquierda; en móvil, barra segmentada de 9 tramos bajo el encabezado con el nombre de la fase actual. Cada marca es un enlace (navegación por teclado) con `aria-current="step"` en la activa.
- **Trayectoria**: una línea vertical continua une las secciones; el tramo recorrido se pinta en Electric Violet según el scroll.
- **Revelado**: los titulares entran con un desplazamiento de 16 px + opacidad al cruzar el 80 % de la pantalla (IntersectionObserver; GSAP solo donde haga falta sincronizar con el scroll).
- **Etapas**: en escritorio, las 3 misiones en vivo se apilan como etapas al entrar en la sección (fijado ≤ 1,2 pantallas). En móvil, apilado con revelado normal.

## I-03 · Recomendador «Configura tu misión»

Preguntas (botones; Enter/Espacio; foco pasa al siguiente enunciado):

1. **¿Cómo prefieres aprender?** En vivo con un trainer · A mi ritmo, cuando pueda → _A mi ritmo_ termina en **Nebula**.
2. **¿Quién se va a formar?** Solo yo · Mi equipo · Mi empresa, con un programa a medida → _A medida_ termina en **Odyssey**.
3. **¿Hasta dónde quieres llegar?** Usar la IA a diario y entender su impacto (**Ignition**) · Prompts precisos y agentes para mi rol (**Booster**) · Automatizar procesos con n8n (**Liftoff**).

Resultado: nombre, duración, 2–3 viñetas **literales** de «Incluye» que justifican la elección, alternativa más cercana, CTA real (inscripción; WhatsApp para Odyssey) y «Ver en el plan de vuelo», que lleva a la etapa resaltada. «Volver a empezar» siempre disponible. El resultado se anuncia con `aria-live`.
Si el perfil del hero está elegido, la pregunta 2 llega marcada (Independiente → Solo yo; Líder → Mi equipo; Empresa → Mi empresa), y se puede cambiar.

## I-04 · Banco de pruebas (exploración libre) — se diseña en la siguiente iteración

- Selector de perfil (los 4 de casos de uso) → tarea real de una empresa de Santander → control deslizante antes/después (teclado: flechas) + demo corta de prompt.
- Cada demo indica la herramienta (de las 14) y la misión donde se aprende → enlace a la etapa.
- Etiqueta visible «Ejemplo simulado».
- Complemento: constelación de las 14 herramientas filtrable por objetivo; cada estrella es un botón que abre su ficha.

## I-05 · Microinteracciones

- Botones: hover (aclarado + 1 px arriba), active (1 px abajo), foco con anillo Soft de 3 px.
- Enlaces del menú: subrayado que crece desde la izquierda.
- Etapa recomendada: borde Electric + píldora «Recomendada para ti».
- Barra de acción móvil: aparece al salir del hero; se oculta mientras el foco está dentro del recomendador o del banco de pruebas, y cuando el menú está abierto.

## Bocetos (móvil 375 px)

```
┌───────────────────────────┐   ┌───────────────────────────┐
│ [LOGO]          ☰  [Ins.] │   │ ▮▮▮▮▮▯▯▯▯  +03 · ETAPAS    │
│ ▮▯▯▯▯▯▯▯▯  T−10 TRIPULAC. │   │ (ETAPAS)                  │
│ (PLAN DE VUELO · T−10)    │   │ Elige tu misión.          │
│ Evoluciona a la           │   │ ┌ Configura tu misión ──┐ │
│ velocidad de la           │   │ │ 1/3 ¿Cómo prefieres   │ │
│ tecnología.               │   │ │ aprender?             │ │
│ Formación práctica…       │   │ │ [En vivo con trainer] │ │
│ ¿Quién va en esta misión? │   │ │ [A mi ritmo]          │ │
│ [Empresa][Líder][Indep.]  │   │ └───────────────────────┘ │
│ [ Ver planes          → ] │   │ ① IGNITION 4 h ████       │
│   ╲ trayectoria ╱ ·       │   │ ② BOOSTER  8 h ████████   │
│                           │   │ ③ LIFTOFF 12 h ██████████…│
├───────────────────────────┤   │ ODYSSEY · NEBULA          │
│ [ Inscríbete ]   [ WA ]   │   │ [ Inscríbete ]   [ WA ]   │
└───────────────────────────┘   └───────────────────────────┘
```

Escritorio (1440 px): hero en dos columnas (texto 7/12 · trayectoria 5/12), riel de fases fijo a la izquierda, recomendador a la izquierda (5/12) y etapas a la derecha (7/12) en la sección de misiones.
