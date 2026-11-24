# Sistema de diseño — «Plan de vuelo»

> Estado: **implementado** en `src/styles/` (tokens en `base/_tokens.scss`; componentes en `components/`). El control en píldora seleccionable es `.chip` (`components/_chip.scss`).
> Se diseña primero para 375 px y luego se amplía.

## 1. Tokens de color

Solo la paleta del manual, más opacidades de esa misma paleta.

```css
--black: #050507; /* fondo */
--white: #ffffff; /* titulares */
--body: #dcd6ea; /* texto largo (tono de apoyo del manual) */
--muted: #8e8998; /* texto secundario, pies */
--evox: #7026e8; /* CTA, pasos numerados */
--electric: #9636ff; /* halos, trayectoria activa */
--soft: #b783ff; /* palabra destacada, píldoras, foco */
--card: rgb(183 131 255 / 0.1); /* tarjeta = Soft Violet al 10 % */
--line: rgb(183 131 255 / 0.18); /* filetes y trayectorias inactivas */
--line-strong: rgb(183 131 255 / 0.4);
```

| Pareja           | Uso                               | Contraste |
| ---------------- | --------------------------------- | --------- |
| White / Black    | titulares                         | 20,4      |
| Body / Black     | párrafos                          | ≈ 14,8    |
| Muted / Black    | secundario (≥ 14 px)              | 6,0       |
| Soft / Black     | palabra destacada, enlaces        | 7,5       |
| Black / Soft     | píldoras                          | 7,5       |
| White / Evox     | botón principal                   | 6,7       |
| Electric / Black | **solo** trazos y números ≥ 32 px | 4,1       |

## 2. Tipografía (Poppins)

Escala fluida con `clamp()`; mínimo de 14 px en texto real.

| Rol                   | Peso | Tamaño (375 → 1440) | Interlineado | Tracking                     |
| --------------------- | ---- | ------------------- | ------------ | ---------------------------- |
| Display (H1)          | 800  | 40 → 88 px          | 1,04         | −0,02 em                     |
| H2 sección            | 800  | 32 → 60 px          | 1,08         | −0,015 em                    |
| H3                    | 700  | 20 → 26 px          | 1,25         | 0                            |
| Lead                  | 400  | 17 → 20 px          | 1,55         | 0                            |
| Texto                 | 400  | 16 px               | 1,6          | 0                            |
| Botón                 | 600  | 15 → 16 px          | 1            | 0                            |
| Etiqueta / píldora    | 600  | 12 px               | 1            | 0,16 em, MAYÚSCULAS          |
| Código de fase (T−10) | 700  | 12–14 px            | 1            | 0,12 em, cifras tabulares    |
| Numeral gráfico       | 800  | 64 → 160 px         | 0,9          | −0,04 em, en `--line-strong` |

Regla: **una sola palabra en Soft Violet por titular**.

## 3. Espacio, rejilla y forma

- Base 4 px. Escala: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128.
- Margen lateral: 20 px (móvil) → 32 px (tableta) → `max(48px, (100vw − 1200px)/2)` (escritorio).
- Rejilla de 12 columnas desde 960 px; 4 columnas en móvil.
- Separación entre secciones: 96 px (móvil) → 160 px (escritorio).
- Radios: tarjeta 24 px · bloque CTA 28 px · botones y píldoras 999 px · paso numerado 12 px.
- Filetes de 1 px en `--line`. Sin sombras paralelas; la profundidad viene de los halos y la opacidad.

## 4. Recursos gráficos del manual, traducidos a web

| Recurso                  | Implementación                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Halos                    | `radial-gradient` de Electric (arriba-derecha) y Evox (abajo-izquierda), recortados a la esquina de la sección, a ≤ 45 % de opacidad, **nunca bajo el texto**. Uno por sección como máximo. |
| Píldora                  | `--soft` + texto `--black`, 600, MAYÚSCULAS, 0,16 em. Encima del H2: nombra la fase («T−0 · IGNICIÓN»).                                                                                     |
| Palabra destacada        | `<em>` con `color: var(--soft)`, sin cursiva ni subrayado.                                                                                                                                  |
| Pasos numerados          | Cuadro de 40 px, `--evox`, número blanco 700. Solo en las etapas 1-2-3 y en las preguntas del recomendador (el orden importa).                                                              |
| Tarjetas                 | `--card`, radio 24 px. Solo para listas de 2 a 4 ideas.                                                                                                                                     |
| Bloque CTA               | `--evox`, radio 28 px. Uno por sección.                                                                                                                                                     |
| **Trayectoria** (propio) | Línea SVG de 1,5 px en `--line`; tramo recorrido en `--electric`. Es el hilo que une las secciones.                                                                                         |

## 5. Componentes

| Componente       | Variantes / estados                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`         | primary (Evox), secondary (borde `--line-strong`), ghost (texto Soft). Estados: hover (Evox se aclara hacia Electric y sube 1 px), active (baja 1 px), focus (anillo de 3 px en Soft, separación de 3 px), disabled. Altura mín. 48 px (objetivo táctil). |
| `Pill`           | estática / con punto «en vivo».                                                                                                                                                                                                                           |
| `PhaseRail`      | escritorio: riel vertical izquierdo con 9 marcas; móvil: barra segmentada bajo el encabezado + nombre de la fase.                                                                                                                                         |
| `ProfileChoice`  | 3 botones con `aria-pressed`.                                                                                                                                                                                                                             |
| `StageRow`       | etapa en vivo: número, nombre, barra de horas proporcional (4/8/12), lista «Incluye», CTA.                                                                                                                                                                |
| `TrajectoryCard` | Odyssey y Nebula: trayectorias aparte.                                                                                                                                                                                                                    |
| `Recommender`    | paso (fieldset + opciones), progreso, resultado, reiniciar.                                                                                                                                                                                               |
| `ActionBar`      | móvil: Inscríbete + WhatsApp, fija abajo; escritorio: integrada en el encabezado.                                                                                                                                                                         |
| `Accordion`      | FAQs, `<details>` nativo mejorado.                                                                                                                                                                                                                        |

## 6. Movimiento

- Duraciones: micro 160 ms · entrada 480 ms · trayectoria 900 ms. Curva por defecto `cubic-bezier(.2,.7,.2,1)`.
- Solo se animan `transform` y `opacity` (y `stroke-dashoffset` en SVG).
- `prefers-reduced-motion: reduce` → sin desplazamientos ni dibujado; cambios de estado instantáneos o con fundido ≤ 120 ms.
- Ninguna sección se fija más de 1,2 pantallas; nunca se intercepta la rueda ni el gesto de scroll.
