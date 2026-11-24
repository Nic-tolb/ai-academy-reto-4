# Estrategia de experiencia — Fase 2

> Estado: **PROPUESTA** (pendiente de validación junto con la dirección creativa).

## 1. Objetivo comercial
Que quien llega (muchas veces desde un anuncio, en el celular) **se inscriba** o **hable con un especialista por WhatsApp**. Objetivo secundario: que una empresa llegue al **Diagnóstico**.

## 2. Perfiles de visitante
Basados en la pregunta sugerida por el reto y en las audiencias del manual.

| Perfil | Qué necesita saber | Objeción típica [I] | Misiones candidatas (datos reales) | CTA principal |
|---|---|---|---|---|
| **Empresa** (dueño, gerente, director de innovación) | Que la formación se adapta a su industria y deja resultados medibles | «¿Vale la pena sacar al equipo un día?» | Odyssey (100 % personalizado), Liftoff (automatización con n8n) | WhatsApp con especialista / Diagnóstico |
| **Líder de equipo** (RR. HH., jefe de área) | Qué tareas repetitivas del equipo se resuelven | «Mi equipo no es técnico» | Booster (agentes para el rol), Ignition | Inscripción / WhatsApp |
| **Independiente** (profesional, freelancer) | Un resultado concreto y cómo llegar | «No tengo tiempo» | Ignition (4 h), Nebula (pregrabado, 24/7) | Inscripción |

## 3. Arquitectura de información propuesta
Se reordena con la lógica del manual («Primero el ejercicio; al final, la invitación») y la forma gancho → problema → perspectiva → ideas → demostración → acción.

| # | Sección (fase del viaje) | Contenido de origen | Función | Interacción |
|---|---|---|---|---|
| 0 | **Cuenta regresiva** (hero) | Hero + «Evoluciona…» + Ver planes | Gancho y personalización | I-01: «¿Quién eres?» (Empresa / Líder de equipo / Independiente) |
| 1 | **Gravedad** — el problema | ¿Por qué ahora? + «antes» de los casos | Reconocer la tarea que pesa | Revelado por scroll |
| 2 | **Ignición** — el cambio | Casos de uso antes/después | Cambio de perspectiva | I-04 (candidata): antes/después deslizable por perfil |
| 3 | **Instrumentos** — con qué | 14 herramientas | Demostración | I-04 (candidata): constelación filtrable |
| 4 | **Por qué con nosotros** | Beneficios | Confianza | Revelado por scroll |
| 5 | **Elige tu misión** | 5 misiones + recomendador | Decisión | I-03 |
| 6 | **Bitácora de tripulaciones** | Reseñas | Prueba social | Carrusel accesible |
| 7 | **Control de misión** | FAQs + Diagnóstico + Certificado | Resolver objeciones | Acordeón (con Max «Analítico», si hay archivos) |
| 8 | **Despegue** | CTA final + footer legal | Conversión | — |

Hilo transversal: **I-02** indicador de progreso del viaje (fases 0–8) siempre visible, que además sirve de navegación.

## 4. Estrategia de CTA
- **Barra de acción persistente**: en escritorio, en el menú fijo (Inscríbete + icono de WhatsApp). En móvil, barra inferior compacta que aparece tras el hero y **se oculta mientras el visitante usa una pieza interactiva** o abre el menú (no interrumpe).
- **CTA contextual**: el resultado del recomendador lleva a inscripción (o a WhatsApp si es Odyssey). El perfil elegido en el hero cambia el texto del CTA («Hablar con un especialista» para Empresa; «Inscribirme» para Independiente).
- **Una llamada principal por bloque** (regla del manual).
- WhatsApp con mensaje prellenado que incluya la misión recomendada → mejor calificación del contacto (propuesta: requiere aprobación porque modifica el texto del enlace).

## 5. Principios de interacción
1. Cada interacción responde a: ¿qué aporta?, ¿por qué genera interés?, ¿cómo acerca a la conversión?
2. Nunca se bloquea el scroll; nunca se fija una sección más de ~1,5 pantallas.
3. Todo lo que funciona con cursor funciona con toque y teclado.
4. Con `prefers-reduced-motion`, la historia se cuenta igual con fundidos.
5. El contenido es HTML real desde el servidor: la página se entiende aunque falle el JS.
