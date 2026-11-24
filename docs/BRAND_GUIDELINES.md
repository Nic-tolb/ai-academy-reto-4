# Reglas de marca aplicables a la landing

> Fuente: `manual-de-marca-ai-academy-v1.pdf` (v1.0, 21 nov 2026, borrador para revisión).
> Estado de cada regla según el manual: **CONFIRMADO / APROBADO** (obligatorio) · **PROPUESTA** (usar, pero se puede ajustar con criterio).

## Color — CONFIRMADO

| Token        | Hex       | Uso en la landing                                                      |
| ------------ | --------- | ---------------------------------------------------------------------- |
| `--black`    | `#050507` | Fondo principal (~60 %)                                                |
| `--white`    | `#FFFFFF` | Titulares y texto que carga el mensaje (~25 %)                         |
| `--evox`     | `#7026E8` | CTA, botones, bloques destacados, números de paso                      |
| `--electric` | `#9636FF` | Halos, gráficos, acentos de energía                                    |
| `--soft`     | `#B783FF` | Palabra destacada del titular, etiquetas, casco                        |
| `--muted`    | `#8E8998` | Texto secundario, pies, fechas                                         |
| `--body`     | `#DCD6EA` | Texto largo sobre negro (PROPUESTA; no sustituye a White en titulares) |

Derivados permitidos (misma tinta, opacidad): tarjetas = Soft Violet al 10 %; bordes = blanco/violeta a baja opacidad.

### Contraste (WCAG 2.1, según manual)

| Combinación             | Ratio | Permitido                               |
| ----------------------- | ----- | --------------------------------------- |
| White / Black           | 20,4  | Todo                                    |
| Soft Violet / Black     | 7,5   | Todo                                    |
| Black / Soft Violet     | 7,5   | Etiquetas y botones                     |
| White / Evox Purple     | 6,7   | Todo (CTA)                              |
| Muted Gray / Black      | 6,0   | Secundario                              |
| White / Electric Violet | 4,9   | Todo                                    |
| Electric Violet / Black | 4,1   | **Solo titulares grandes**              |
| Evox Purple / Black     | 3,0   | **Solo formas y titulares muy grandes** |
| White / Soft Violet     | 2,7   | **Nunca**                               |

Regla: «Si todo es violeta, nada destaca». Una sola palabra en Soft Violet por titular.

## Tipografía — CONFIRMADO

- **Poppins** exclusivamente (400, 500, 600, 700, 800). Ninguna otra familia, tampoco monoespaciada.
- La letra del logotipo no se usa para escribir textos.
- Escala de Instagram (PROPUESTA) como referencia de proporción: portada 800 / interlineado 1,06; titular 800; subtítulo/CTA 700; texto 400 / 1,4 en `#DCD6EA`; etiqueta 600 MAYÚSCULAS, espaciado 0,16 em; pie 500 en Muted Gray.

## Logo — CONFIRMADO / APROBADO

- Usar **siempre el archivo original**; nunca redibujar ni reescribir.
- Sobre negro: **versión principal a color** (casco violeta + texto blanco), vertical.
- Espacio ancho y bajo (barra de navegación): **horizontal blanca**.
- Espacio cuadrado y pequeño (favicon): **casco solo** (mín. 32 px).
- Zona de protección: x = altura de la palabra ACADEMY, libre en los 4 lados.
- Tamaño mínimo en pantalla: vertical 120 px de ancho; horizontal 160 px; casco 32 px.
- Prohibido: estirar, rotar, recolorear, sombras/contornos/brillos/degradados, fondos recargados, separar casco y nombre.
- Las horizontales de agosto 2026 que decían «campuslands IA» están retiradas.
- **Implicación técnica**: el logo no se anima con rotación ni escala distorsionada (la landing actual lo rota 360°: eso queda fuera).

## Nombre — PROPUESTA

- Primera mención: **Campuslands AI Academy**. Siguientes: **AI Academy**.
- La tecnología en textos en español: **IA**.
- Instagram: **@ai.campuslands**.

## Recursos gráficos — PROPUESTA

- **Halos**: Electric Violet arriba a la derecha, Evox Purple abajo a la izquierda. **Nunca detrás del texto.**
- **Etiqueta en píldora**: Soft Violet + texto Black en MAYÚSCULAS, encima del titular.
- **Palabra destacada**: una idea en Soft Violet, sin subrayado.
- **Pasos numerados**: cuadros redondeados Evox Purple con número blanco, solo si el orden importa.
- **Tarjetas**: Soft Violet al 10 %, radio 28 px (en 1080 → ~20–24 px en web).
- **Bloque de CTA**: Evox Purple, radio 32 px. Una sola llamada a la acción por bloque.

## Fotografía — CONFIRMADO para el símbolo; lista Sí/No del manual

- Sí: personas reales, trainers, equipos en sesión, pantallas reales de herramientas, luz natural.
- No: robots, cerebros brillantes, mano humana/robot, **fotos de banco de personas genéricas**, imágenes IA que parezcan fotos de clase, capturas con datos de clientes.
- El reto permite bancos libres «si necesitas fotos de personas» → tensión con el manual (ver PROJECT_MASTER, riesgos).

## Max, la mascota — CONFIRMADO / APROBADO

- Acompaña historias, portadas, recursos y **respuestas a preguntas frecuentes**.
- Sobre negro con halo violeta. Solo las 4 expresiones: Cansado pero listo (el problema), Motivado (logros), Analítico (preguntas, comparaciones), Idea (la solución).
- No reemplaza a personas reales; no se recolorea; no se generan poses nuevas; no se escribe en el visor.

## Voz — CONFIRMADO

- Español claro, profesional, cercano; tuteo.
- Inteligentes, no académicos · técnicos, no herméticos · cercanos, no infantiles · provocadores, no vendedores de humo · comerciales, no antes que útiles.
- Forma: gancho → problema → cambio de perspectiva → 3–5 ideas → demostración → acción → CTA.
- Evitar: «revolucionario», «el futuro ya llegó», «la IA te va a reemplazar», promesas sin caso, anglicismos innecesarios, emojis en exceso.
- Ejemplos de Colombia y Santander.

## Fuera de alcance

- No mezclar con **Future Minds** (azules, amarillo, Nunito, Gumi).
