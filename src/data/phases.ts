/**
 * Fases del «Plan de vuelo» (docs/INTERACTIONS.md, I-02).
 * Cuenta regresiva real: un paso por fase, de T−8 a T−0. El despegue (T−0)
 * es la inscripción: toda la página prepara ese momento.
 */
export interface Phase {
  id: string;
  code: string;
  name: string;
}

export const PHASES = [
  { id: 'tripulacion', code: 'T−8', name: 'Tripulación' },
  { id: 'urgencia', code: 'T−7', name: 'Carga útil' },
  { id: 'casos-uso', code: 'T−6', name: 'Ensayo' },
  { id: 'herramientas', code: 'T−5', name: 'Instrumentos' },
  { id: 'beneficios', code: 'T−4', name: 'Sistemas' },
  { id: 'planes', code: 'T−3', name: 'Etapas' },
  { id: 'resenas', code: 'T−2', name: 'Bitácora' },
  { id: 'faqs', code: 'T−1', name: 'Control de misión' },
  { id: 'despegue', code: 'T−0', name: 'Despegue' },
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
