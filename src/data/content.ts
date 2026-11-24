/**
 * Contenido literal de la landing actual (docs/RESEARCH.md §2).
 * Solo se corrigió el nombre de la marca («IA Academy» → «AI Academy»).
 */

export const BENEFITS = [
  {
    tag: 'Práctica',
    title: 'Formación práctica',
    text: 'Sesiones personalizadas de 4 h, 8 h y 12 h con casos reales para tu negocio.',
  },
  {
    tag: 'Entregables',
    title: 'Entregables listos',
    text: 'Banco de prompts, guías operativas y agentes base adaptados a tu industria.',
  },
  {
    tag: 'Soporte',
    title: 'Soporte continuo',
    text: 'Comunidad privada de WhatsApp y soporte posventa para resolver dudas.',
  },
  {
    tag: 'Rutas',
    title: 'Rutas flexibles',
    text: 'Cursos presenciales y virtuales por niveles, con resultados medibles.',
  },
] as const;

export const URGENCY = [
  {
    title: 'La IA ya es estándar operativo',
    text: 'Las empresas líderes integran IA en procesos diarios; cada semana de espera amplía la brecha competitiva.',
  },
  {
    title: 'El costo de esperar se acumula',
    text: 'Más horas manuales y más retrabajo frente a competidores que automatizan desde hoy.',
  },
  {
    title: 'Tu talento quiere crear, no repetir',
    text: 'Los equipos buscan herramientas que liberen tiempo para tareas estratégicas; si no se las das, las buscarán fuera.',
  },
  {
    title: 'Efecto compuesto del aprendizaje',
    text: 'Cada día sin práctica resta valor acumulado en prompts, agentes y casos listos para escalar.',
  },
] as const;

export const CASES = [
  {
    id: 'empresario',
    role: 'Empresario / Emprendedor',
    before:
      'Procesos comerciales manuales, lanzamientos lentos y decisiones a ciegas por falta de contenido y reportes actualizados.',
    after:
      'Asistentes de IA que crean emails, propuestas y reportes en minutos, con métricas claras para escalar ventas sin fricción.',
  },
  {
    id: 'innovacion',
    role: 'Director(a) de Innovación',
    before:
      'Pilotos desconectados que no escalan y escasa evidencia para justificar inversión ante la dirección.',
    after:
      'Workshops intensivos de 4h con agentes funcionales, casos de uso claros y métricas de eficiencia listas para presentar.',
  },
  {
    id: 'independiente',
    role: 'Profesional Independiente',
    before:
      'Demasiado tiempo en tareas repetitivas, poco foco en vender y mínima diferenciación frente al mercado.',
    after:
      'Prompts estratégicos que generan propuestas, automatizan el seguimiento y entregan resultados personalizados en segundos.',
  },
  {
    id: 'rrhh',
    role: 'Líder de RR. HH.',
    before: 'Onboarding genérico, procesos manuales y nulo acompañamiento adaptado a cada rol.',
    after:
      'Rutas de microlearning con bots que guían, responden dudas y capturan feedback continuo de forma automática.',
  },
] as const;

export type ToolGroup = 'Pensar y escribir' | 'Investigar' | 'Automatizar' | 'Crear' | 'Organizar';

/** Las 14 herramientas con sus taglines literales. La agrupación es editorial. */
export const TOOLS: readonly { name: string; tagline: string; group: ToolGroup }[] = [
  {
    name: 'ChatGPT',
    tagline: 'Asistente conversacional para ideas y código',
    group: 'Pensar y escribir',
  },
  {
    name: 'Claude',
    tagline: 'IA colaborativa con atención al detalle',
    group: 'Pensar y escribir',
  },
  { name: 'Gemini', tagline: 'Visión multimodal impulsada por Google', group: 'Pensar y escribir' },
  {
    name: 'Microsoft Copilot',
    tagline: 'Asistencia integrada en el ecosistema Microsoft',
    group: 'Organizar',
  },
  {
    name: 'GitHub Copilot',
    tagline: 'Colaborador de código en tiempo real',
    group: 'Pensar y escribir',
  },
  { name: 'Perplexity', tagline: 'Investigación asistida por IA', group: 'Investigar' },
  {
    name: 'NotebookLM',
    tagline: 'Tu asistente de investigación personalizado',
    group: 'Investigar',
  },
  {
    name: 'Read AI',
    tagline: 'Resúmenes y análisis inteligentes para reuniones',
    group: 'Organizar',
  },
  { name: 'Notion AI', tagline: 'Organización y contenido en un solo espacio', group: 'Organizar' },
  { name: 'Make', tagline: 'Orquestación visual de procesos', group: 'Automatizar' },
  { name: 'Zapier', tagline: 'Automatización con inteligencia contextual', group: 'Automatizar' },
  { name: 'Midjourney', tagline: 'Diseño visual impulsado por prompts', group: 'Crear' },
  { name: 'ElevenLabs', tagline: 'Voces sintéticas realistas y clonación de voz', group: 'Crear' },
  { name: 'HeyGen', tagline: 'Creación de avatares y videos con IA', group: 'Crear' },
];

export const TOOL_GROUPS: readonly ToolGroup[] = [
  'Pensar y escribir',
  'Investigar',
  'Organizar',
  'Automatizar',
  'Crear',
];

export const TESTIMONIALS = [
  {
    name: 'Laura Gómez',
    role: 'Tech Lead en InnovApp',
    quote:
      'AI Academy nos dio herramientas concretas para acelerar nuestros procesos. El enfoque práctico nos permitió aplicar lo aprendido desde el primer día.',
  },
  {
    name: 'Carlos Herrera',
    role: 'Director de Talento, Grupo Andino',
    quote:
      'La formación de 8 horas fue ideal para nuestro equipo. Los casos por industria marcaron la diferencia y resolvieron dudas específicas.',
  },
  {
    name: 'Juliana Restrepo',
    role: 'Fundadora de CrecePyme',
    quote:
      'Más que un curso, fue una experiencia de estrategia digital. Las automatizaciones de seguimiento nos ahorran horas cada semana.',
  },
  {
    name: 'Miguel Ángel López',
    role: 'Profesor universitario',
    quote:
      'Excelente acompañamiento. Adaptaron el contenido a educación superior y nos dejaron material listo para incorporar en clase.',
  },
] as const;

export const FAQS = [
  {
    q: '¿Qué modalidades de formación ofrecen?',
    a: 'Formación presencial en las instalaciones de Campuslands, presencial en las instalaciones del cliente y virtual. Todas las modalidades mantienen la misma calidad y contenido.',
  },
  {
    q: '¿Cómo se eligen las fechas de los cursos?',
    a: 'Si te formas por tu cuenta, eliges la fecha que mejor te convenga. Para empresas, coordinamos las fechas por WhatsApp para encontrar el momento ideal para todo el equipo.',
  },
  {
    q: '¿Necesito conocimientos previos en IA?',
    a: 'No son obligatorios. Los cursos van desde el «despertar digital» hasta niveles avanzados y se adaptan al nivel de cada participante.',
  },
  {
    q: '¿Qué tipo de certificación recibo?',
    a: 'Una certificación oficial por las horas cursadas, que valida tu conocimiento en las herramientas de IA específicas que aprendiste durante la formación.',
  },
  {
    q: '¿Qué materiales están incluidos?',
    a: 'Todos los cursos incluyen un banco de prompts especializado. Los cursos de 8 h y 12 h incluyen además agentes personalizados y automatizaciones acordadas según tus necesidades.',
  },
  {
    q: '¿Cómo funcionan los pagos?',
    a: 'Próximamente habrá pagos a través de Wompi. Mientras tanto, escríbenos por WhatsApp para coordinar el pago.',
  },
] as const;
