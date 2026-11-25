/**
 * Enlaces reales de la landing actual (docs/RESEARCH.md §2.2).
 * Destinos y número de WhatsApp sin cambios. El mensaje prellenado solo corrige
 * el nombre de la marca («IA Academy» → «AI Academy»), aprobado en D-18.
 */
const ORIGIN = 'https://campuslands.aiacademy.com.co';

const WHATSAPP_NUMBER = '573052105674';
const WHATSAPP_TEXT = 'Hola, quiero información del curso de IA de Campuslands AI Academy';

export const LINKS = {
  inscripcion: `${ORIGIN}/inscripcion`,
  diagnostico: `${ORIGIN}/diagnostico`,
  certificado: `${ORIGIN}/certificado`,
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_TEXT)}`,
  instagram: 'https://www.instagram.com/ai.campuslands/',
  /** En la landing actual apuntan a «#»: pendientes de confirmar (R4). */
  privacidad: null,
  terminos: null,
} as const;
