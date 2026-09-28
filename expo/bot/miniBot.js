// Motor del mini bot de BuildWise Labs. Responde con el contenido del propio
// sitio (servicios, proceso, preguntas frecuentes y documentacion) usando el
// conocimiento de ./knowledge.js. No usa servidor ni IA externa.
//
// Para conectarlo a un modelo de IA mas adelante: reemplaza `reply` por una
// llamada a tu backend (p. ej. POST /api/bot) y conserva la misma forma de
// respuesta { text, actions?, chips? } para no tocar la interfaz.
import { SERVICES } from '../src/constants/services';
import { FAQS, PROCESS_STEPS } from '../src/constants/home';
import { OWN_DOCS } from '../src/constants/ownDocs';
import {
  ACTIONS,
  FAQ_SYNONYMS,
  INTENTS,
  QUICK,
  SERVICE_KEYS,
  STOP_WORDS,
  WELCOME,
} from './knowledge';

export { QUICK, WELCOME };

// Texto sin acentos, en minusculas y sin signos.
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s.]/g, ' ');

const STOP = new Set(STOP_WORDS.split(' '));
const words = (s) => norm(s).split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const has = (text, list) => list.some((k) => text.includes(k));
const toService = (s) => ({ label: `Ver ${s.title}`, route: 'Servicio', params: { id: s.id } });

/** Pregunta frecuente mas parecida (palabras en comun + sinonimos) o null. */
function bestFaq(input) {
  const t = norm(input);
  const tw = new Set(words(input));
  let best = null;
  let score = 0;
  FAQS.forEach((f, i) => {
    let sc = words(f.q).filter((w) => tw.has(w)).length;
    if (has(t, FAQ_SYNONYMS[i] || [])) sc += 2;
    if (sc > score) {
      score = sc;
      best = f;
    }
  });
  return score >= 2 ? best : null;
}

/**
 * Respuesta del bot a un mensaje del usuario.
 * @param {string} input
 * @returns {{ text: string, actions?: {label: string, route: string, params?: object}[], chips?: string[] }}
 */
export function reply(input) {
  const t = ` ${norm(input)} `;

  if (has(t, INTENTS.greeting.keys)) return { text: INTENTS.greeting.text, chips: QUICK };

  if (has(t, INTENTS.contact.keys)) return { text: INTENTS.contact.text, actions: [ACTIONS.contact] };

  // Preguntas frecuentes (precio, tiempos, seguridad de datos...).
  const faq = bestFaq(input);
  if (faq) return { text: faq.a, actions: [ACTIONS.contact], chips: ['Servicios', 'Cómo trabajan'] };

  // Un servicio en concreto, o varios.
  const hits = SERVICES.filter((s) => has(t, SERVICE_KEYS[s.id] || []));
  if (hits.length === 1) {
    const s = hits[0];
    return { text: `${s.title}: ${s.description}`, actions: [toService(s), ACTIONS.contact] };
  }
  if (hits.length > 1 || has(t, INTENTS.services.keys)) {
    const list = hits.length > 1 ? hits : SERVICES;
    return {
      text: `${INTENTS.services.text}\n${list.map((s) => `• ${s.title}`).join('\n')}`,
      actions: list.map(toService),
    };
  }

  if (has(t, INTENTS.process.keys)) {
    const steps = PROCESS_STEPS.map((p, i) => `${i + 1}. ${p.title} (${p.duration})`).join('\n');
    return { text: `${INTENTS.process.text}\n${steps}\n${INTENTS.process.outro}`, actions: [ACTIONS.contact] };
  }

  if (has(t, INTENTS.docs.keys)) {
    const all = Object.values(OWN_DOCS);
    const found = all.filter((d) => words(d.title).some((w) => t.includes(w)));
    const list = (found.length ? found : all).slice(0, 4);
    return {
      text: found.length ? INTENTS.docs.found : INTENTS.docs.all,
      actions: [
        ...list.map((d) => ({ label: d.title.replace(/^\W+/, ''), route: 'Documento', params: { id: d.id } })),
        ACTIONS.allDocs,
      ],
    };
  }

  if (has(t, INTENTS.thanks.keys)) return { text: INTENTS.thanks.text, chips: QUICK };

  return { text: INTENTS.fallback.text, actions: [ACTIONS.contact, ACTIONS.fullBot], chips: QUICK };
}
