/** Fases del «Plan de vuelo» (docs/INTERACTIONS.md, I-02). */
export interface Phase {
  id: string;
  code: string;
  name: string;
}

export const PHASES = [
  { id: 'tripulacion', code: 'T−10', name: 'Tripulación' },
  { id: 'urgencia', code: 'T−5', name: 'Carga útil' },
  { id: 'casos-uso', code: 'T−0', name: 'Ignición' },
  { id: 'herramientas', code: '+01', name: 'Instrumentos' },
  { id: 'beneficios', code: '+02', name: 'Sistemas' },
  { id: 'planes', code: '+03', name: 'Etapas' },
  { id: 'resenas', code: '+04', name: 'Órbita' },
  { id: 'faqs', code: '+05', name: 'Control de misión' },
  { id: 'despegue', code: '↑', name: 'Despegue' },
] as const satisfies readonly Phase[];

export type PhaseId = (typeof PHASES)[number]['id'];

export function phase(id: PhaseId): Phase {
  const found = PHASES.find((p) => p.id === id);
  if (!found) throw new Error(`Fase desconocida: ${id}`);
  return found;
}

/** Menú principal: el orden y los nombres exigidos por el reto (C-01). */
export const NAV = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Herramientas', href: '#herramientas' },
  { label: 'Planes', href: '#planes' },
  { label: '¿Por qué ahora?', href: '#urgencia' },
  { label: 'Casos de uso', href: '#casos-uso' },
  { label: 'FAQs', href: '#faqs' },
] as const;
