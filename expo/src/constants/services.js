// Catalogo y contenido de la plataforma (estructura estilo IBM).
// Iconos del set Ionicons (incluido en @expo/vector-icons).
import { IMAGES } from './images';
import { CLAUDE_LOGO, N8N_LOGO, GROQ_LOGO, GEMINI_LOGO, CLAUDE_SVG, N8N_SVG, GROQ_SVG, GEMINI_SVG, OLLAMA_SVG, CISCO_SVG, JUNIPER_SVG } from './logos';

const _botSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><radialGradient id="bg" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="#0d1f2d"/><stop offset="100%" stop-color="#05080a"/></radialGradient><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#4589ff" stop-opacity="0.18"/><stop offset="100%" stop-color="#4589ff" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="450" fill="url(#bg)"/>
<rect width="800" height="450" fill="url(#glow)"/>
<!-- grid lines -->
<g stroke="#1a2e42" stroke-width="1" opacity="0.5">
  <line x1="0" y1="75" x2="800" y2="75"/><line x1="0" y1="150" x2="800" y2="150"/>
  <line x1="0" y1="225" x2="800" y2="225"/><line x1="0" y1="300" x2="800" y2="300"/>
  <line x1="0" y1="375" x2="800" y2="375"/>
  <line x1="100" y1="0" x2="100" y2="450"/><line x1="200" y1="0" x2="200" y2="450"/>
  <line x1="300" y1="0" x2="300" y2="450"/><line x1="400" y1="0" x2="400" y2="450"/>
  <line x1="500" y1="0" x2="500" y2="450"/><line x1="600" y1="0" x2="600" y2="450"/>
  <line x1="700" y1="0" x2="700" y2="450"/>
</g>
<!-- antena -->
<line x1="400" y1="95" x2="400" y2="125" stroke="#4589ff" stroke-width="4" stroke-linecap="round"/>
<circle cx="400" cy="88" r="9" fill="#4589ff" opacity="0.9"/>
<circle cx="400" cy="88" r="5" fill="#a6c8ff"/>
<!-- cabeza del bot -->
<rect x="255" y="125" width="290" height="200" rx="28" fill="#0f1e2e" stroke="#4589ff" stroke-width="2.5" opacity="0.95"/>
<!-- brillo superior -->
<rect x="280" y="130" width="240" height="6" rx="3" fill="#4589ff" opacity="0.15"/>
<!-- ojos -->
<rect x="297" y="175" width="72" height="52" rx="14" fill="#061523" stroke="#4589ff" stroke-width="2"/>
<rect x="431" y="175" width="72" height="52" rx="14" fill="#061523" stroke="#4589ff" stroke-width="2"/>
<!-- pupilas / iris animadas -->
<circle cx="333" cy="201" r="16" fill="#4589ff" opacity="0.9"/>
<circle cx="467" cy="201" r="16" fill="#4589ff" opacity="0.9"/>
<circle cx="339" cy="196" r="7" fill="#a6c8ff"/>
<circle cx="473" cy="196" r="7" fill="#a6c8ff"/>
<circle cx="343" cy="193" r="3" fill="#ffffff"/>
<circle cx="477" cy="193" r="3" fill="#ffffff"/>
<!-- boca / display de mensajes -->
<rect x="297" y="252" width="206" height="42" rx="10" fill="#061523" stroke="#4589ff" stroke-width="1.5" opacity="0.9"/>
<rect x="308" y="264" width="60" height="6" rx="3" fill="#4589ff" opacity="0.7"/>
<rect x="376" y="264" width="40" height="6" rx="3" fill="#697077" opacity="0.5"/>
<rect x="308" y="277" width="90" height="6" rx="3" fill="#697077" opacity="0.4"/>
<!-- cuerpo -->
<rect x="300" y="330" width="200" height="70" rx="16" fill="#0f1e2e" stroke="#4589ff" stroke-width="1.5" opacity="0.9"/>
<!-- botones cuerpo -->
<circle cx="345" cy="358" r="10" fill="#4589ff" opacity="0.8"/>
<circle cx="375" cy="358" r="10" fill="#1a4f8a" opacity="0.6"/>
<circle cx="405" cy="358" r="10" fill="#1a4f8a" opacity="0.6"/>
<rect x="330" y="374" width="140" height="6" rx="3" fill="#4589ff" opacity="0.25"/>
<!-- brazos -->
<rect x="188" y="330" width="108" height="24" rx="12" fill="#0f1e2e" stroke="#4589ff" stroke-width="1.5"/>
<rect x="504" y="330" width="108" height="24" rx="12" fill="#0f1e2e" stroke="#4589ff" stroke-width="1.5"/>
<!-- manos -->
<circle cx="188" cy="342" r="18" fill="#0f1e2e" stroke="#4589ff" stroke-width="1.5"/>
<circle cx="612" cy="342" r="18" fill="#0f1e2e" stroke="#4589ff" stroke-width="1.5"/>
<!-- particulas flotantes -->
<circle cx="160" cy="160" r="3" fill="#4589ff" opacity="0.4"/>
<circle cx="640" cy="140" r="4" fill="#4589ff" opacity="0.3"/>
<circle cx="680" cy="300" r="3" fill="#a6c8ff" opacity="0.3"/>
<circle cx="130" cy="310" r="3" fill="#a6c8ff" opacity="0.35"/>
<circle cx="720" cy="200" r="5" fill="#4589ff" opacity="0.2"/>
<!-- label inferior -->
<text x="400" y="428" text-anchor="middle" fill="#4589ff" opacity="0.4" font-size="12" font-family="monospace" letter-spacing="8">CHATBOT · IA LOCAL · BUILDWISE</text>
</svg>`;
const CHATBOT_IMAGE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(_botSvg)}`;

export const SERVICES = [
  {
    id: 'chatbot',
    icon: 'chatbubbles-outline',
    title: 'Chatbot Inteligente para PYMES',
    tagline: 'Asistente con voz, texto y analisis de datos',
    description:
      'Asistente conversacional local con IA que atiende a tus clientes, analiza archivos Excel y automatiza consultas sin depender de servicios externos.',
    image: CHATBOT_IMAGE,
    intro:
      'Despliega un asistente de IA completamente local que corre en tu infraestructura. Tus clientes o equipo pueden comunicarse por texto o voz, subir hojas de calculo y obtener analisis instantaneos, todo sin enviar datos a terceros.',
    features: [
      { icon: 'mic-outline', title: 'Voz y texto', text: 'Interaccion natural por texto o microfono con respuesta en tiempo real.' },
      { icon: 'document-text-outline', title: 'Analisis de Excel', text: 'Sube archivos de combustible, gastos o ventas y recibe calculos diarios, semanales y totales automaticamente.' },
      { icon: 'server-outline', title: '100% local con Ollama', text: 'El modelo de lenguaje corre en tu propio servidor. Sin costos por token, sin datos en la nube.' },
    ],
    deliverables: [
      'Chatbot desplegado en Docker listo para produccion',
      'Interfaz Open WebUI personalizable',
      'Procesamiento de Excel: combustible, gastos, ventas',
      'Reporte descargable con resumen diario, semanal y por unidad',
      'Modelo de lenguaje local (llama3, mistral u otro)',
      'Capacitacion para tu equipo',
    ],
    bullets: ['Voz y texto', 'Analisis de Excel', 'IA 100% local'],
    sidebar: [
      {
        group: 'Documentacion',
        icon: 'document-text-outline',
        items: ['Descripcion general', 'Arquitectura del sistema', 'Glosario de terminos'],
      },
      {
        group: 'Iniciar proyecto',
        icon: 'rocket-outline',
        items: ['Requisitos previos', 'Instalacion paso a paso', 'Como levantar un bot', 'Configuracion inicial', 'Primer mensaje de prueba'],
      },
      {
        group: 'Tools',
        icon: 'construct-outline',
        items: ['APIs disponibles', 'Integraciones n8n', 'Plugins de voz', 'Procesamiento de Excel', 'Webhooks'],
      },
      {
        group: 'Soporte',
        icon: 'help-circle-outline',
        items: ['Preguntas frecuentes', 'Reportar un problema', 'Tiempo de respuesta', 'Contacto directo'],
      },
      {
        group: 'Comunidad',
        icon: 'people-outline',
        items: ['Foro de usuarios', 'Canal de Discord', 'Casos de uso compartidos', 'Contribuir al proyecto'],
      },
      {
        group: 'Orientaciones',
        icon: 'compass-outline',
        items: ['Buenas practicas', 'Seguridad y privacidad', 'Limitaciones conocidas', 'Hoja de ruta'],
      },
      {
        group: 'Educacion',
        icon: 'school-outline',
        items: ['Tutoriales en video', 'Guia de prompts', 'Ejemplos practicos', 'Certificacion basica'],
      },
      {
        group: 'Compatibilidad',
        icon: 'hardware-chip-outline',
        items: ['Sistemas operativos (Windows, Linux, macOS)', 'Procesadores (x86-64, ARM64)', 'GPU recomendadas (NVIDIA, AMD)', 'RAM minima recomendada', 'Requisitos de red'],
      },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80&auto=format&fit=crop',
    ],
    guide: [
      {
        step: 1,
        title: 'Chatbot con Claude (Anthropic)',
        badge: { label: 'Anthropic', color: '#D97757', logo: CLAUDE_LOGO },
        svgIcon: CLAUDE_SVG,
        description: 'Claude es el modelo mas avanzado para razonamiento y analisis de documentos. Ideal para bots que necesitan entender contexto complejo.',
        phoneMockup: {
          screens: [
            {
              id: 'chat',
              title: 'Chatbot · Claude',
              subtitle: 'claude-sonnet-4-5',
              items: [
                { icon: '🧑', label: '¿Cuanto combustible consumio ABC-123?', sub: 'usuario' },
                { icon: '🤖', label: 'El vehículo ABC-123 consumió 48L esta semana, 12% por encima del promedio.', sub: 'Claude' },
              ],
              code: 'Tokens usados: 312\nLatencia: ~1.2s',
            },
          ],
        },
        code: `npm install @anthropic-ai/sdk

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Enviar un mensaje y recibir respuesta
const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: '¿Cuanto combustible consumio el vehiculo ABC-123 esta semana?' }
  ],
  system: 'Eres un asistente de flota vehicular. Analiza datos y responde con claridad.',
});

console.log(response.content[0].text);`,
        lang: 'js',
      },
      {
        step: 2,
        title: 'Historial de conversacion con Claude',
        badge: { label: 'Anthropic', color: '#D97757', logo: CLAUDE_LOGO },
        description: 'Para mantener contexto entre mensajes, acumula el historial y envialo completo en cada peticion.',
        phoneMockup: {
          screens: [
            {
              id: 'msg1',
              title: 'Chat · BuildWise Bot',
              subtitle: 'historial activo',
              items: [
                { icon: '🧑', label: 'Hola, quiero saber sobre automatizacion', sub: 'turno 1' },
                { icon: '🤖', label: 'Claro, automatizamos flujos con n8n + IA.', sub: 'Claude' },
              ],
              actions: [{ label: 'Siguiente mensaje →', to: 'msg2' }],
            },
            {
              id: 'msg2',
              title: 'Chat · BuildWise Bot',
              subtitle: 'contexto acumulado: 2 turnos',
              items: [
                { icon: '🧑', label: '¿Cuanto cuesta el plan basico?', sub: 'turno 2' },
                { icon: '🤖', label: 'El plan basico parte desde $299/mes. ¿Quieres un presupuesto personalizado?', sub: 'Claude (recuerda turno 1)' },
              ],
              back: 'msg1',
            },
          ],
        },
        code: `const historial = [];

async function chat(userMsg) {
  historial.push({ role: 'user', content: userMsg });

  const res = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: 'Eres un asistente de ventas para BuildWise Labs.',
    messages: historial,
  });

  const reply = res.content[0].text;
  historial.push({ role: 'assistant', content: reply });
  return reply;
}

// Uso:
await chat('Hola, quiero saber sobre automatizacion');
await chat('Cuanto cuesta el plan basico?');`,
        lang: 'js',
      },
      {
        step: 3,
        title: 'Modelo local con Ollama',
        badge: { label: 'Ollama', color: '#0D1117', logo: 'https://ollama.com/public/ollama.png' },
        svgIcon: OLLAMA_SVG,
        description: 'Ollama corre modelos de lenguaje 100% en tu maquina. Sin costos por token, sin datos en la nube. Ideal para informacion sensible.',
        phoneMockup: {
          screens: [
            {
              id: 'ollama',
              title: 'Ollama · Local',
              subtitle: 'localhost:11434 · sin internet',
              items: [
                { icon: '🦙', label: 'llama3.2 · 2GB', sub: '✅ descargado' },
                { icon: '🌊', label: 'mistral · 4GB', sub: '✅ descargado' },
                { icon: '🧠', label: 'deepseek-r1:8b · 5GB', sub: '⬇ descargando...' },
              ],
              code: '$ ollama serve\n→ Listening on 127.0.0.1:11434\n→ 100% privado · 0 tokens/$ facturados',
            },
          ],
        },
        code: `# 1. Instalar Ollama
# Windows/Mac: descarga desde https://ollama.com
# Linux:
curl -fsSL https://ollama.com/install.sh | sh

# 2. Descargar un modelo
ollama pull llama3.2          # 2GB — rapido, bueno para tareas generales
ollama pull mistral           # 4GB — equilibrio calidad/velocidad
ollama pull deepseek-r1:8b   # 5GB — razonamiento avanzado

# 3. Levantar el servidor (corre en http://localhost:11434)
ollama serve

# 4. Probar desde terminal
ollama run llama3.2 "Explica que es n8n en una oracion"`,
        lang: 'bash',
      },
      {
        step: 4,
        title: 'Conectar Ollama desde Node.js',
        badge: { label: 'Ollama', color: '#0D1117', logo: 'https://ollama.com/public/ollama.png' },
        svgIcon: OLLAMA_SVG,
        description: 'Ollama expone una API compatible con OpenAI. Puedes usar el SDK de OpenAI apuntando a localhost, o fetch directo.',
        phoneMockup: {
          screens: [
            {
              id: 'resp',
              title: 'API · localhost:11434',
              subtitle: 'POST /api/chat · llama3.2',
              items: [
                { icon: '📤', label: 'Resume este reporte de ventas...', sub: 'user message' },
                { icon: '📥', label: 'En Q3 las ventas crecieron 18%. Los productos A y B lideran con 62% del total...', sub: 'llama3.2 response' },
              ],
              code: 'Latencia: 420ms · Sin API key · Local',
            },
          ],
        },
        code: `// Opcion A: fetch directo (sin dependencias)
const res = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'Resume este reporte de ventas...' }],
    stream: false,
  }),
});
const data = await res.json();
console.log(data.message.content);

// Opcion B: SDK de OpenAI apuntando a Ollama
import OpenAI from 'openai';
const ollama = new OpenAI({ baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' });

const chat = await ollama.chat.completions.create({
  model: 'llama3.2',
  messages: [{ role: 'user', content: 'Hola' }],
});
console.log(chat.choices[0].message.content);`,
        lang: 'js',
      },
      {
        step: 5,
        title: 'Chatbot ultra rapido con Groq',
        badge: { label: 'Groq', color: '#F55036', logo: GROQ_LOGO },
        svgIcon: GROQ_SVG,
        description: 'Groq corre modelos en hardware especializado (LPU) con latencias de ~200ms. Perfecto para bots en tiempo real. Plan gratuito generoso.',
        phoneMockup: {
          screens: [
            {
              id: 'groq',
              title: 'Groq · LPU Inference',
              subtitle: 'llama-3.3-70b-versatile',
              items: [
                { icon: '🧑', label: '¿Tienen soporte en fin de semana?', sub: 'usuario' },
                { icon: '⚡', label: 'Sí, nuestro equipo atiende sábado y domingo de 9am a 6pm.', sub: 'Groq · 187ms' },
              ],
              code: '⚡ Latencia: 187ms\n🆓 Plan gratuito: 6000 req/día',
            },
          ],
        },
        code: `npm install groq-sdk

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',  // o 'mixtral-8x7b-32768', 'gemma2-9b-it'
  messages: [
    { role: 'system', content: 'Eres un asistente de atencion al cliente.' },
    { role: 'user', content: '¿Tienen soporte en fin de semana?' },
  ],
  temperature: 0.7,
  max_tokens: 512,
});

console.log(chat.choices[0].message.content);
// Respuesta tipica: < 300ms`,
        lang: 'js',
      },
      {
        step: 6,
        title: 'Gemini de Google',
        badge: { label: 'Gemini', color: '#1A73E8', logo: GEMINI_LOGO },
        svgIcon: GEMINI_SVG,
        description: 'Gemini 2.0 Flash es el modelo mas rapido de Google con ventana de contexto de 1M tokens. Ideal para analizar documentos largos.',
        phoneMockup: {
          screens: [
            {
              id: 'gemini',
              title: 'Gemini 2.0 Flash',
              subtitle: '1M tokens de contexto',
              items: [
                { icon: '📄', label: 'Reporte Q3 2024.pdf (48 págs)', sub: 'documento adjunto' },
                { icon: '✨', label: '1. Ventas +18% vs Q2. 2. Producto A lidera. 3. Riesgo en distribución norte.', sub: 'Gemini · análisis completo' },
              ],
              code: 'Contexto: 1,000,000 tokens\n🆓 Gratis con límites de RPM',
            },
          ],
        },
        code: `npm install @google/genai

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Chat simple
const res = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Analiza el siguiente reporte de ventas y dame los 3 puntos clave...',
});
console.log(res.text);

// Con historial de conversacion
const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  history: [
    { role: 'user', parts: [{ text: 'Hola, soy gerente de ventas' }] },
    { role: 'model', parts: [{ text: '¡Hola! ¿En que te puedo ayudar?' }] },
  ],
});
const reply = await chat.sendMessage({ message: '¿Que modelo de IA me conviene?' });
console.log(reply.text);`,
        lang: 'js',
      },
      {
        step: 7,
        title: 'Comparativa de modelos',
        description: 'Elige el modelo segun tu caso de uso. Puedes combinarlos: Ollama para privacidad, Groq para velocidad, Claude para razonamiento complejo.',
        phoneMockup: {
          screens: [
            {
              id: 'tabla',
              title: 'Selector de modelo',
              subtitle: 'elige segun tu caso de uso',
              items: [
                { icon: '🟠', label: 'Claude Sonnet · Análisis complejo', sub: '~$3/M tokens · nube' },
                { icon: '🔴', label: 'Groq llama-3.3 · Tiempo real', sub: 'Gratis · 187ms latencia' },
                { icon: '⚫', label: 'Ollama llama3.2 · Privacidad', sub: 'Gratis · 100% local' },
                { icon: '🔵', label: 'Gemini Flash · Docs largos', sub: 'Gratis · 1M tokens' },
              ],
            },
          ],
        },
        code: `/*
 MODELO              VELOCIDAD   COSTO       PRIVACIDAD   MEJOR PARA
 ─────────────────────────────────────────────────────────────────────
 claude-sonnet-4-5   Media       ~$3/M tok   Nube         Analisis complejo, docs
 claude-haiku-4-5    Alta        ~$0.8/M     Nube         Respuestas rapidas, bajo costo
 llama3.2 (Ollama)   Alta*       Gratis      100% local   Datos sensibles, sin internet
 mistral (Ollama)    Media*      Gratis      100% local   Equilibrio calidad/velocidad
 groq/llama-3.3-70b  Muy alta    Gratis**    Nube         Tiempo real, prototipos
 gemini-2.0-flash    Alta        Gratis**    Nube         Contexto largo, multimedia
 ─────────────────────────────────────────────────────────────────────
 * depende del hardware local
 ** planes gratuitos con limites de RPM/TPD
*/`,
        lang: 'js',
      },
      {
        step: 8,
        title: 'Bot con switch de proveedor',
        description: 'Arquitectura que permite cambiar de proveedor con una variable de entorno, sin tocar la logica del bot.',
        phoneMockup: {
          screens: [
            {
              id: 'claude-mode',
              title: '.env · LLM_PROVIDER',
              subtitle: 'cambia sin tocar codigo',
              items: [
                { icon: '🟠', label: 'LLM_PROVIDER=claude', sub: 'activo ahora' },
              ],
              code: 'LLM_PROVIDER=claude\n→ Usando Claude Haiku',
              actions: [{ label: 'Cambiar a Groq →', to: 'groq-mode' }],
            },
            {
              id: 'groq-mode',
              title: '.env · LLM_PROVIDER',
              subtitle: 'sin cambiar una línea de lógica',
              items: [
                { icon: '🔴', label: 'LLM_PROVIDER=groq', sub: 'activo ahora' },
              ],
              code: 'LLM_PROVIDER=groq\n→ Usando llama-3.3-70b · ⚡187ms',
              actions: [{ label: 'Cambiar a Ollama →', to: 'ollama-mode' }],
            },
            {
              id: 'ollama-mode',
              title: '.env · LLM_PROVIDER',
              subtitle: '100% local, cero costo',
              items: [
                { icon: '⚫', label: 'LLM_PROVIDER=ollama', sub: 'activo ahora' },
              ],
              code: 'LLM_PROVIDER=ollama\n→ Usando llama3.2 · localhost',
              back: 'claude-mode',
            },
          ],
        },
        code: `// src/llm.js — adaptador universal
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';

const PROVIDER = process.env.LLM_PROVIDER || 'claude'; // 'claude' | 'groq' | 'ollama'

export async function ask(messages, system = '') {
  if (PROVIDER === 'claude') {
    const c = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await c.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      messages,
    });
    return r.content[0].text;
  }

  if (PROVIDER === 'groq') {
    const g = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const r = await g.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
    });
    return r.choices[0].message.content;
  }

  if (PROVIDER === 'ollama') {
    const r = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama3.2', messages, stream: false }),
    });
    return (await r.json()).message.content;
  }
}

// .env
// LLM_PROVIDER=claude   → usa Claude
// LLM_PROVIDER=groq     → usa Groq (rapido, gratis)
// LLM_PROVIDER=ollama   → usa modelo local`,
        lang: 'js',
      },
    ],
  },
  {
    id: 'automatizacion',
    icon: 'git-network-outline',
    title: 'Automatizacion Inteligente',
    tagline: 'Flujos autonomos con n8n + IA',
    description:
      'Flujos de trabajo que conectan tus herramientas y ejecutan tareas repetitivas sin intervencion humana.',
    image: IMAGES.automation,
    intro:
      'Conectamos las herramientas que ya usas y disenamos flujos que trabajan por ti las 24 horas. Cuando una tarea necesita criterio, un agente de IA toma la decision siguiendo tus reglas.',
    features: [
      { icon: 'sync-outline', title: 'Integraciones', text: 'Conecta CRM, correo, hojas de calculo, ERP y mas con n8n.' },
      { icon: 'sparkles-outline', title: 'Agentes de IA', text: 'Automatiza decisiones y respuestas con modelos de lenguaje.' },
      { icon: 'time-outline', title: 'Ahorro real', text: 'Recupera horas cada semana eliminando el trabajo manual.' },
    ],
    deliverables: [
      'Diagnostico de procesos automatizables',
      'Flujos configurados y documentados',
      'Monitoreo y alertas',
      'Capacitacion a tu equipo',
    ],
    bullets: ['Integraciones con n8n', 'Agentes con IA', 'Ahorro de horas/mes'],
    guide: [
      {
        step: 1,
        title: 'Automatizaciones con Claude (Anthropic)',
        badge: { label: 'Anthropic', color: '#D97757', logo: CLAUDE_LOGO },
        svgIcon: CLAUDE_SVG,
        description: 'Claude puede analizar documentos, tomar decisiones y ejecutar acciones dentro de tus flujos automatizados. Ideal para clasificar correos, resumir reportes o responder consultas complejas.',
        phoneMockup: {
          screens: [
            {
              id: 'correo',
              title: 'Clasificador de correos',
              subtitle: 'Claude · automatico',
              items: [
                { icon: '📧', label: 'Asunto: "Factura vencida #4421"', sub: 'entrada' },
                { icon: '🤖', label: 'categoria: soporte · prioridad: alta', sub: 'JSON de Claude' },
                { icon: '⚡', label: 'accion: Escalar a técnico de facturación', sub: 'decision tomada' },
              ],
              code: '→ Ticket creado automáticamente\n→ Notificación enviada a Slack',
            },
          ],
        },
        code: `npm install @anthropic-ai/sdk

import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Clasificar un correo entrante y decidir la accion
async function procesarCorreo(asunto, cuerpo) {
  const res = await claude.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: \`Eres un clasificador de correos. Responde SOLO con JSON:
{ "categoria": "ventas|soporte|spam|otro", "prioridad": "alta|media|baja", "accion": "string" }\`,
    messages: [{ role: 'user', content: \`Asunto: \${asunto}\nCuerpo: \${cuerpo}\` }],
  });
  return JSON.parse(res.content[0].text);
}

// Resultado: { categoria: "soporte", prioridad: "alta", accion: "Escalar a tecnico" }`,
        lang: 'js',
      },
      {
        step: 2,
        title: 'Flujo completo: n8n + Claude',
        svgIcon: N8N_SVG,
        badge: { label: 'n8n', color: '#EA4B71', logo: N8N_LOGO },
        description: 'Conecta n8n con Claude para crear flujos donde la IA toma decisiones en medio de una automatizacion: recibe datos, razona y devuelve una accion.',
        phoneMockup: {
          screens: [
            {
              id: 'trigger',
              title: 'n8n · Flujo activo',
              subtitle: 'Webhook → Claude → Slack',
              items: [
                { icon: '🔔', label: 'Trigger: Webhook recibido', sub: 'datos de ventas JSON' },
                { icon: '🤖', label: 'Nodo Claude: analizando...', sub: 'claude-haiku-4-5' },
              ],
              actions: [{ label: 'Ver resultado →', to: 'output' }],
            },
            {
              id: 'output',
              title: 'n8n · Resultado',
              subtitle: 'enviado a Slack',
              items: [
                { icon: '📊', label: 'Resumen: ventas Q3 +18% vs Q2', sub: 'generado por Claude' },
                { icon: '✅', label: '#canal-ventas notificado', sub: 'Slack webhook' },
              ],
              code: '→ Flujo completado en 1.4s',
              back: 'trigger',
            },
          ],
        },
        code: `// Nodo "Code" dentro de n8n (JavaScript):
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

// Los datos llegan del nodo anterior (ej: webhook, Google Sheets)
const datos = $input.first().json;

const respuesta = await client.messages.create({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 512,
  system: 'Analiza los datos de ventas y genera un resumen ejecutivo en 3 puntos.',
  messages: [{
    role: 'user',
    content: JSON.stringify(datos),
  }],
});

// Pasa el resumen al siguiente nodo (Slack, Gmail, etc.)
return [{ json: { resumen: respuesta.content[0].text } }];`,
        lang: 'js',
      },
      {
        step: 3,
        title: 'Agente con herramientas (Tool Use)',
        svgIcon: GROQ_SVG,
        badge: { label: 'Anthropic', color: '#D97757', logo: CLAUDE_LOGO },
        description: 'Con Tool Use, Claude puede llamar funciones propias: buscar en tu base de datos, crear registros o enviar notificaciones de forma autonoma.',
        phoneMockup: {
          screens: [
            {
              id: 'input',
              title: 'Agente · Tool Use',
              subtitle: 'Claude decide qué herramienta usar',
              items: [
                { icon: '🧑', label: 'juan@empresa.com tiene error en factura urgente', sub: 'mensaje de entrada' },
                { icon: '🔍', label: 'Claude llama: buscar_cliente("juan@empresa.com")', sub: 'tool call #1' },
              ],
              actions: [{ label: 'Ver resultado →', to: 'result' }],
            },
            {
              id: 'result',
              title: 'Agente · Resultado',
              subtitle: 'acciones ejecutadas',
              items: [
                { icon: '✅', label: 'Cliente encontrado: Juan Pérez · ID #1042', sub: 'buscar_cliente OK' },
                { icon: '🎫', label: 'Ticket #8821 creado · prioridad: alta', sub: 'crear_ticket OK' },
              ],
              code: '→ 2 herramientas · 0 intervención humana',
              back: 'input',
            },
          ],
        },
        code: `const tools = [
  {
    name: 'buscar_cliente',
    description: 'Busca un cliente por nombre o email en la base de datos.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nombre o email del cliente' },
      },
      required: ['query'],
    },
  },
  {
    name: 'crear_ticket',
    description: 'Crea un ticket de soporte para un cliente.',
    input_schema: {
      type: 'object',
      properties: {
        cliente_id: { type: 'string' },
        descripcion: { type: 'string' },
        prioridad: { type: 'string', enum: ['alta', 'media', 'baja'] },
      },
      required: ['cliente_id', 'descripcion', 'prioridad'],
    },
  },
];

const res = await claude.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  tools,
  messages: [{ role: 'user', content: 'El cliente juan@empresa.com reporta que su factura tiene un error urgente.' }],
});

// Claude decide llamar buscar_cliente y luego crear_ticket automaticamente`,
        lang: 'js',
      },
      {
        step: 4,
        title: 'Resumen automatico de documentos PDF',
        svgIcon: GEMINI_SVG,
        badge: { label: 'Anthropic', color: '#D97757', logo: CLAUDE_LOGO },
        description: 'Claude puede leer y analizar documentos largos. Util para resumir contratos, facturas o reportes que llegan por correo o webhook.',
        phoneMockup: {
          screens: [
            {
              id: 'pdf',
              title: 'PDF · Análisis automático',
              subtitle: 'reporte.pdf · 48 páginas',
              items: [
                { icon: '📄', label: 'reporte.pdf procesado', sub: '48 páginas · base64' },
                { icon: '🤖', label: '1. Ventas +18% Q3\n2. Riesgo logístico norte\n3. Fecha límite: 15 oct', sub: 'Claude · 5 puntos clave' },
              ],
              code: '→ Resultado enviado por email\n→ Guardado en Google Sheets',
            },
          ],
        },
        code: `import fs from 'fs';

// Leer el PDF como base64
const pdfBase64 = fs.readFileSync('reporte.pdf').toString('base64');

const res = await claude.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
      },
      {
        type: 'text',
        text: 'Resume este documento en 5 puntos clave y extrae las fechas importantes.',
      },
    ],
  }],
});

console.log(res.content[0].text);`,
        lang: 'js',
      },
    ],
  },
  {
    id: 'apps',
    icon: 'phone-portrait-outline',
    title: 'Desarrollo Web / Apps con IA',
    tagline: 'React Native + Claude API',
    description:
      'Aplicaciones moviles y web inteligentes, listas para escalar y desplegar en la nube.',
    image: IMAGES.apps,
    intro:
      'Construimos productos digitales a medida: apps moviles, plataformas web y paneles internos, con IA integrada y listos para desplegar en la nube.',
    features: [
      { icon: 'logo-react', title: 'Multiplataforma', text: 'Una base de codigo para iOS, Android y web con Expo.' },
      { icon: 'server-outline', title: 'Backend a medida', text: 'APIs, bases de datos y autenticacion seguras.' },
      { icon: 'cloud-upload-outline', title: 'Despliegue', text: 'Publicacion continua en Vercel y tiendas de apps.' },
    ],
    deliverables: [
      'Diseno de interfaz y prototipo',
      'App multiplataforma (iOS / Android / web)',
      'Backend e integraciones',
      'Despliegue y mantenimiento',
    ],
    bullets: ['Expo / React Native', 'Backend a medida', 'Despliegue en Vercel'],
    guide: [
      {
        step: 1,
        title: 'Crear proyecto Expo (mobile + web)',
        description: 'Expo te permite usar una sola base de codigo para iOS, Android y web. Usa el template blank para empezar limpio.',
        code: `npx create-expo-app mi-app --template blank
cd mi-app
npx expo install react-dom react-native-web @expo/metro-runtime`,
        lang: 'bash',
        phoneMockup: {
          screens: [
            {
              id: 'welcome',
              title: 'mi-app',
              subtitle: 'Expo Go · localhost:8081',
              items: [
                { icon: '📱', label: 'Open up App.js to start working on your app!', sub: 'src/App.js' },
                { icon: '🔄', label: 'Save to reload', sub: 'Hot reload activo' },
              ],
              code: 'npx expo start\n→ Metro bundler corriendo\n→ App lista en tu dispositivo',
            },
          ],
        },
      },
      {
        step: 2,
        title: 'Configurar NativeWind (Tailwind para React Native)',
        description: 'NativeWind aplica clases Tailwind tanto en mobile como en web sin configuracion adicional.',
        phoneMockup: {
          screens: [
            {
              id: 'nw',
              title: 'NativeWind · Estilos',
              subtitle: 'Tailwind en React Native',
              items: [
                { icon: '🎨', label: 'className="bg-blue-500 p-4 rounded-xl"', sub: 'clases Tailwind' },
                { icon: '📱', label: 'Funciona en iOS · Android · Web', sub: 'mismo codigo' },
                { icon: '⚡', label: 'Hot reload instantaneo', sub: 'sin reiniciar' },
              ],
              code: '✅ Tailwind compilado\n✅ Fuentes cargadas',
            },
          ],
        },
        code: `npm install nativewind tailwindcss
npx tailwindcss init

# tailwind.config.js
module.exports = {
  content: ['./App.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
};

# babel.config.js
module.exports = {
  presets: [
    ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    'nativewind/babel',
  ],
};`,
        lang: 'js',
      },
      {
        step: 3,
        title: 'Crear proyecto Vite (solo web)',
        description: 'Si necesitas una app puramente web con React, Vite es la opcion mas rapida. Ideal para dashboards o landing pages.',
        phoneMockup: {
          screens: [
            {
              id: 'vite',
              title: 'Vite · React App',
              subtitle: 'localhost:5173',
              items: [
                { icon: '⚡', label: 'Vite v5 · React 18', sub: 'bundler ultrarapido' },
                { icon: '🌐', label: 'HMR activo · < 50ms reload', sub: 'Hot Module Replacement' },
                { icon: '🏗️', label: 'Build en < 2s', sub: 'dist/ lista para Vercel' },
              ],
              code: '$ npm run dev\n→ http://localhost:5173\n→ ready in 312ms',
            },
          ],
        },
        code: `npm create vite@latest mi-web -- --template react
cd mi-web
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`,
        lang: 'bash',
      },
      {
        step: 4,
        title: 'Levantar el backend Node.js',
        description: 'Un servidor Express minimo con soporte ESM, CORS y variables de entorno. Sirve como API para tu app Expo o Vite.',
        phoneMockup: {
          screens: [
            {
              id: 'server',
              title: 'Express · API Server',
              subtitle: 'localhost:3000',
              items: [
                { icon: '🟢', label: 'GET /health → { status: "ok" }', sub: '200 OK · 4ms' },
                { icon: '🔒', label: 'CORS habilitado', sub: 'frontend conectado' },
                { icon: '📦', label: 'express · cors · dotenv', sub: 'dependencias' },
              ],
              code: '$ node server.js\n→ API corriendo en :3000',
            },
          ],
        },
        code: `npm init -y
npm install express cors dotenv
# package.json → "type": "module"

# server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(process.env.PORT || 3000, () =>
  console.log('API corriendo en :3000'));`,
        lang: 'js',
      },
      {
        step: 5,
        title: 'Conectar frontend con el backend',
        description: 'Centraliza la URL base en una variable de entorno para cambiarla facilmente entre desarrollo y produccion.',
        phoneMockup: {
          screens: [
            {
              id: 'env-dev',
              title: 'API · Conexión',
              subtitle: 'dev vs produccion',
              items: [
                { icon: '💻', label: 'Dev: EXPO_PUBLIC_API_URL=http://localhost:3000', sub: '.env local' },
                { icon: '🌐', label: 'Prod: EXPO_PUBLIC_API_URL=https://buildwiselabs.net', sub: '.env.production' },
              ],
              code: 'fetch(BASE + "/health")\n→ { status: "ok" }',
            },
          ],
        },
        code: `# .env (Expo)
EXPO_PUBLIC_API_URL=http://localhost:3000

# .env (Vite)
VITE_API_URL=http://localhost:3000

# services/api.js (Expo)
const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const get = (path) => fetch(BASE + path).then(r => r.json());

# services/api.js (Vite)
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const get = (path) => fetch(BASE + path).then(r => r.json());`,
        lang: 'js',
      },
      {
        step: 6,
        title: 'Build y despliegue',
        description: 'Expo exporta la app web a una carpeta dist lista para Vercel. El backend se despliega en cualquier VPS o Hostinger.',
        phoneMockup: {
          screens: [
            {
              id: 'build',
              title: 'Deploy · Produccion',
              subtitle: 'buildwiselabs.net',
              items: [
                { icon: '📦', label: 'npx expo export --platform web', sub: 'dist/ generado' },
                { icon: '🚀', label: 'Vercel deploy · 45s', sub: 'frontend en vivo' },
                { icon: '🟢', label: 'buildwiselabs.net · online', sub: 'SSL automático' },
              ],
              code: '✅ Frontend: Vercel\n✅ Backend: Hostinger :3000',
            },
          ],
        },
        code: `# Expo → web
npx expo export --platform web
# Sube la carpeta dist/ a Vercel o Hostinger

# Vite → web
npm run build
# Sube la carpeta dist/ a Vercel

# Backend (Hostinger / VPS)
npm install
node server.js
# O con PM2 para produccion:
pm2 start server.js --name backend`,
        lang: 'bash',
      },
      {
        step: 7,
        title: 'Instalar React Navigation',
        description: 'React Navigation maneja las rutas y transiciones entre pantallas en Expo. Instala el nucleo y el stack nativo.',
        phoneMockup: {
          screens: [
            {
              id: 'install',
              title: 'React Navigation',
              subtitle: 'instalacion completada',
              items: [
                { icon: '✅', label: '@react-navigation/native', sub: 'instalado' },
                { icon: '✅', label: '@react-navigation/native-stack', sub: 'instalado' },
                { icon: '✅', label: 'react-native-screens', sub: 'instalado' },
              ],
              code: '→ Listo para configurar Stack',
            },
          ],
        },
        code: `npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context`,
        lang: 'bash',
      },
      {
        step: 8,
        title: 'Configurar el navegador raiz (App.js)',
        description: 'Envuelve tu app en NavigationContainer y define las pantallas con createNativeStackNavigator. Cada "Screen" es una ruta.',
        code: `import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import DetalleScreen from './src/screens/DetalleScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Detalle" component={DetalleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`,
        lang: 'js',
        phoneMockup: {
          screens: [
            {
              id: 'inicio',
              title: 'Stack.Navigator',
              subtitle: 'Pantalla activa: Inicio',
              items: [
                { icon: '🏠', label: 'HomeScreen', sub: 'screens/HomeScreen.js' },
                { icon: '📋', label: 'DetalleScreen', sub: 'screens/DetalleScreen.js' },
              ],
              actions: [{ label: 'navigate("Detalle") →', to: 'detalle' }],
            },
            {
              id: 'detalle',
              title: 'DetalleScreen',
              subtitle: 'route.params: { id: 42 }',
              items: [
                { icon: '🔑', label: 'id: 42', sub: 'route.params.id' },
                { icon: '📝', label: 'titulo: "Hola"', sub: 'route.params.titulo' },
              ],
              back: 'inicio',
            },
          ],
        },
      },
      {
        step: 9,
        title: 'Navegar entre pantallas',
        description: 'Cada screen recibe navigation como prop. Usa navigate() para ir a otra pantalla y goBack() para volver.',
        phoneMockup: {
          screens: [
            {
              id: 'home',
              title: 'HomeScreen',
              subtitle: 'navigation.navigate()',
              items: [{ icon: '🏠', label: 'Pantalla de inicio', sub: 'screens/HomeScreen.js' }],
              actions: [{ label: 'Ver detalle →', to: 'detalle' }],
            },
            {
              id: 'detalle',
              title: 'DetalleScreen',
              subtitle: 'route.params recibidos',
              items: [
                { icon: '🔑', label: 'id: 42', sub: 'route.params.id' },
                { icon: '📝', label: 'titulo: "Hola"', sub: 'route.params.titulo' },
              ],
              back: 'home',
            },
          ],
        },
        code: `// HomeScreen.js
export default function HomeScreen({ navigation }) {
  return (
    <View>
      <Button
        title="Ver detalle"
        onPress={() => navigation.navigate('Detalle', { id: 42, titulo: 'Hola' })}
      />
    </View>
  );
}

// DetalleScreen.js — recibe los parametros con route.params
export default function DetalleScreen({ route, navigation }) {
  const { id, titulo } = route.params;
  return (
    <View>
      <Text>{titulo} — ID: {id}</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </View>
  );
}`,
        lang: 'js',
      },
      {
        step: 10,
        title: 'Tabs inferiores (Bottom Tabs)',
        description: 'Para apps con navegacion por pestanas instala el paquete de tabs. Ideal para separar secciones principales.',
        phoneMockup: {
          screens: [
            {
              id: 'inicio-tab',
              title: 'Inicio',
              subtitle: 'Tab activa',
              items: [{ icon: '🏠', label: 'Pantalla de Inicio', sub: 'Tab.Screen name="Inicio"' }],
              actions: [{ label: 'Servicios ▷', to: 'servicios-tab' }],
            },
            {
              id: 'servicios-tab',
              title: 'Servicios',
              subtitle: 'Tab activa',
              items: [{ icon: '⚙️', label: 'Lista de servicios', sub: 'Tab.Screen name="Servicios"' }],
              actions: [{ label: 'Perfil ▷', to: 'perfil-tab' }],
            },
            {
              id: 'perfil-tab',
              title: 'Perfil',
              subtitle: 'Tab activa',
              items: [{ icon: '👤', label: 'Perfil de usuario', sub: 'Tab.Screen name="Perfil"' }],
              back: 'inicio-tab',
            },
          ],
        },
        code: `npm install @react-navigation/bottom-tabs

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Inicio: 'home-outline',
              Servicios: 'grid-outline',
              Perfil: 'person-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#c026d3',
          tabBarInactiveTintColor: '#8d8d8d',
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Servicios" component={ServiciosScreen} />
        <Tab.Screen name="Perfil" component={PerfilScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,
        lang: 'js',
      },
      {
        step: 11,
        title: 'useNavigation y useRoute (desde cualquier componente)',
        description: 'Si un componente hijo necesita navegar sin recibir navigation como prop, usa los hooks de React Navigation.',
        phoneMockup: {
          screens: [
            {
              id: 'hook',
              title: 'useNavigation Hook',
              subtitle: 'desde cualquier componente',
              items: [
                { icon: '🔗', label: 'useNavigation()', sub: 'sin recibir props' },
                { icon: '📍', label: 'useRoute().params', sub: 'leer params desde hijo' },
                { icon: '🎯', label: 'navigation.navigate("Contacto")', sub: 'navegar directo' },
              ],
              code: '→ No necesitas prop drilling',
            },
          ],
        },
        code: `import { useNavigation, useRoute } from '@react-navigation/native';

export default function MiBoton() {
  const navigation = useNavigation();
  const route = useRoute(); // para leer params desde un componente hijo

  return (
    <Pressable onPress={() => navigation.navigate('Contacto')}>
      <Text>Ir a Contacto</Text>
    </Pressable>
  );
}`,
        lang: 'js',
      },
      {
        step: 12,
        title: 'Deep linking (URLs en web)',
        description: 'Para que las rutas funcionen como URLs reales en web (ej: /servicios/apps), configura el linking en NavigationContainer.',
        phoneMockup: {
          screens: [
            {
              id: 'url1',
              title: 'Deep Linking · Web',
              subtitle: 'buildwiselabs.net',
              items: [{ icon: '🌐', label: 'buildwiselabs.net/', sub: 'Inicio' }],
              actions: [{ label: '/servicios →', to: 'url2' }],
            },
            {
              id: 'url2',
              title: 'Deep Linking · Web',
              subtitle: 'buildwiselabs.net/servicios',
              items: [{ icon: '🌐', label: 'buildwiselabs.net/servicios', sub: 'ServiciosScreen' }],
              actions: [{ label: '/servicios/apps →', to: 'url3' }],
            },
            {
              id: 'url3',
              title: 'Deep Linking · Web',
              subtitle: 'buildwiselabs.net/servicios/apps',
              items: [
                { icon: '🌐', label: 'buildwiselabs.net/servicios/apps', sub: 'ServiceDetailScreen' },
                { icon: '🔑', label: 'params: { id: "apps" }', sub: 'extraido de la URL' },
              ],
              back: 'url1',
            },
          ],
        },
        code: `const linking = {
  prefixes: ['https://buildwiselabs.net', 'http://localhost:8081'],
  config: {
    screens: {
      Inicio: '',
      Servicios: 'servicios',
      Servicio: 'servicios/:id',
      Nosotros: 'nosotros',
      Contacto: 'contacto',
      Login: 'login',
      Perfil: 'perfil',
    },
  },
};

// En App.js:
<NavigationContainer linking={linking}>
  ...
</NavigationContainer>`,
        lang: 'js',
      },
    ],
  },
  {
    id: 'redes',
    icon: 'shield-checkmark-outline',
    title: 'Seguridad y Redes',
    tagline: 'Auditoria y proteccion',
    description:
      'Servicios de red y evaluacion de seguridad para mantener tu infraestructura protegida.',
    image: IMAGES.security,
    intro:
      'Evaluamos y fortalecemos tu infraestructura: identificamos vulnerabilidades, aplicamos buenas practicas y monitoreamos tus sistemas para reducir riesgos.',
    features: [
      { icon: 'search-outline', title: 'Auditoria', text: 'Analisis de vulnerabilidades y superficie de ataque.' },
      { icon: 'lock-closed-outline', title: 'Proteccion', text: 'Endurecimiento de servidores, DNS y TCP.' },
      { icon: 'pulse-outline', title: 'Monitoreo', text: 'Deteccion temprana de incidentes y respuesta.' },
    ],
    deliverables: [
      'Informe de auditoria de seguridad',
      'Plan de remediacion priorizado',
      'Configuracion de red segura',
      'Monitoreo continuo',
    ],
    bullets: ['Auditoria de seguridad', 'DNS y TCP', 'Buenas practicas'],
    guide: [
      {
        step: 1,
        title: 'Enrutamiento Estatico',
        svgIcon: CISCO_SVG,
        badge: { label: 'Cisco IOS', color: '#049fd9', logo: CISCO_SVG },
        description: 'El enrutamiento estatico define rutas de forma manual. No consume CPU ni ancho de banda en actualizaciones, pero no se adapta a cambios de topologia. Ideal para redes pequenas o rutas de ultimo recurso (default route). En Cisco IOS se configura con "ip route <red> <mascara> <next-hop>". Una ruta flotante tiene distancia administrativa mayor que la ruta dinamica para usarse solo si esta falla.',
        topology: {
          nodes: [
            { id: 'R1', label: 'R1', type: 'router', ip: '10.0.12.1/30', x: 0.15, y: 0.45, detail: ['int G0/0: 192.168.1.1/24', 'int G0/1: 10.0.12.1/30', 'ip route 192.168.2.0 255.255.255.0 10.0.12.2'] },
            { id: 'R2', label: 'R2', type: 'router', ip: '10.0.12.2/30', x: 0.5, y: 0.45, detail: ['int G0/0: 10.0.12.2/30', 'int G0/1: 10.0.23.1/30', 'ip route 192.168.1.0 255.255.255.0 10.0.12.1', 'ip route 192.168.3.0 255.255.255.0 10.0.23.2'] },
            { id: 'R3', label: 'R3', type: 'router', ip: '10.0.23.2/30', x: 0.85, y: 0.45, detail: ['int G0/0: 10.0.23.2/30', 'int G0/1: 192.168.3.1/24', 'ip route 192.168.1.0 255.255.255.0 10.0.23.1'] },
            { id: 'SW1', label: 'LAN1', type: 'switch', ip: '192.168.1.0/24', x: 0.15, y: 0.8, color: '#24a148' },
            { id: 'SW3', label: 'LAN3', type: 'switch', ip: '192.168.3.0/24', x: 0.85, y: 0.8, color: '#24a148' },
          ],
          links: [
            { from: 'R1', to: 'R2', subnet: '10.0.12.0/30', label: 'Static' },
            { from: 'R2', to: 'R3', subnet: '10.0.23.0/30', label: 'Static' },
            { from: 'R1', to: 'SW1', subnet: '192.168.1.0/24' },
            { from: 'R3', to: 'SW3', subnet: '192.168.3.0/24' },
          ],
          detail: 'ip route 192.168.2.0 255.255.255.0 10.0.12.2   → red destino + mascara + next-hop\nip route 0.0.0.0 0.0.0.0 10.0.12.2              → default route\nip route 10.0.0.0 255.0.0.0 Null0 254             → ruta flotante (AD=254)',
        },
      },
      {
        step: 2,
        title: 'RIP v2 — Routing Information Protocol',
        svgIcon: CISCO_SVG,
        badge: { label: 'RIP v2', color: '#6929c4', logo: CISCO_SVG },
        description: 'RIP es un protocolo de vector de distancia (Bellman-Ford). Usa numero de saltos (hop count) como metrica, maximo 15 saltos. Envia tablas de enrutamiento completas cada 30 segundos por broadcast/multicast 224.0.0.9. RIPv2 agrega soporte VLSM, autenticacion MD5 y multicast. Sus limitaciones (lentitud de convergencia, count-to-infinity) lo hacen obsoleto en redes grandes. Split horizon y poison reverse evitan bucles de enrutamiento.',
        topology: {
          nodes: [
            { id: 'R1', label: 'R1', type: 'router', ip: '10.1.0.1', x: 0.2, y: 0.3, detail: ['router rip', 'version 2', 'network 10.0.0.0', 'no auto-summary'] },
            { id: 'R2', label: 'R2', type: 'router', ip: '10.1.0.2', x: 0.5, y: 0.15, detail: ['router rip', 'version 2', 'network 10.0.0.0', 'no auto-summary'] },
            { id: 'R3', label: 'R3', type: 'router', ip: '10.2.0.1', x: 0.8, y: 0.3, detail: ['router rip', 'version 2', 'network 10.0.0.0', 'no auto-summary'] },
            { id: 'R4', label: 'R4', type: 'router', ip: '10.2.0.2', x: 0.5, y: 0.7, detail: ['Metrica maxima: 15 hops', 'Convergencia: ~30-180s'] },
          ],
          links: [
            { from: 'R1', to: 'R2', label: 'hop=1', subnet: '10.1.12.0/30' },
            { from: 'R2', to: 'R3', label: 'hop=1', subnet: '10.1.23.0/30' },
            { from: 'R3', to: 'R4', label: 'hop=1', subnet: '10.1.34.0/30' },
            { from: 'R4', to: 'R1', label: 'hop=1', subnet: '10.1.14.0/30' },
          ],
          detail: 'router rip\n  version 2\n  network 10.0.0.0        → activa RIP en todas las interfaces 10.x.x.x\n  no auto-summary          → deshabilita sumarizacion automatica (necesario con VLSM)\n  passive-interface G0/1  → no envia updates por esa interfaz\n  default-information originate → propaga default route\n\nshow ip rip database\nshow ip route rip\ndebug ip rip',
        },
      },
      {
        step: 3,
        title: 'OSPF — Open Shortest Path First',
        svgIcon: CISCO_SVG,
        badge: { label: 'OSPF', color: '#0043ce', logo: CISCO_SVG },
        description: 'OSPF es un protocolo de estado de enlace (Link State) que usa el algoritmo Dijkstra (SPF). Cada router construye un mapa completo de la topologia (LSDB). La metrica es el costo (cost = 10^8 / BW). Soporta areas para reducir LSA flooding — el Area 0 es el backbone obligatorio. Los routers ABR conectan areas con el backbone. Tipos de LSA: Router LSA (tipo 1), Network LSA (tipo 2), Summary LSA (tipo 3/4), AS External (tipo 5). Roles: DR y BDR en segmentos multi-acceso reducen el numero de adyacencias.',
        topology: {
          nodes: [
            { id: 'ABR', label: 'ABR', type: 'router', ip: 'Area0↔1', x: 0.5, y: 0.45, color: '#da1e28', detail: ['Area Border Router', 'Conecta Area 0 con Area 1', 'router ospf 1', 'router-id 1.1.1.1'] },
            { id: 'BB1', label: 'BB1', type: 'router', ip: '10.0.0.1', x: 0.2, y: 0.25, detail: ['Area 0 — Backbone', 'cost: 1 (GE)', 'cost: 10 (FE)'] },
            { id: 'BB2', label: 'BB2', type: 'router', ip: '10.0.0.2', x: 0.8, y: 0.25, detail: ['Area 0 — Backbone', 'DR en segmento multi-acceso'] },
            { id: 'A1R1', label: 'A1-R1', type: 'router', ip: '10.1.0.1', x: 0.3, y: 0.75, detail: ['Area 1', 'network 10.1.0.0 0.0.0.255 area 1'] },
            { id: 'A1R2', label: 'A1-R2', type: 'router', ip: '10.1.0.2', x: 0.7, y: 0.75, detail: ['Area 1', 'network 10.1.0.0 0.0.0.255 area 1'] },
          ],
          links: [
            { from: 'BB1', to: 'BB2', label: 'Area 0', subnet: '10.0.12.0/30', color: '#da1e28' },
            { from: 'BB1', to: 'ABR', subnet: '10.0.1.0/30', color: '#da1e28' },
            { from: 'BB2', to: 'ABR', subnet: '10.0.2.0/30', color: '#da1e28' },
            { from: 'ABR', to: 'A1R1', label: 'Area 1', subnet: '10.1.0.0/30', color: '#0043ce' },
            { from: 'ABR', to: 'A1R2', subnet: '10.1.1.0/30', color: '#0043ce' },
          ],
          detail: 'router ospf 1\n  router-id 1.1.1.1\n  network 10.0.0.0 0.0.0.255 area 0    → wildcard mask\n  network 10.1.0.0 0.0.0.255 area 1\n  area 1 stub                           → stub area (no LSA tipo 5)\n  auto-cost reference-bandwidth 1000    → ajusta costo para GE/10GE\n\nshow ip ospf neighbor\nshow ip ospf database\nshow ip route ospf\ndebug ip ospf events',
        },
      },
      {
        step: 4,
        title: 'EIGRP — Enhanced Interior Gateway Routing Protocol',
        svgIcon: CISCO_SVG,
        badge: { label: 'EIGRP', color: '#198038', logo: CISCO_SVG },
        description: 'EIGRP es un protocolo hibrido propietario de Cisco (ahora abierto). Combina caracteristicas de vector de distancia y estado de enlace. Usa el algoritmo DUAL (Diffusing Update Algorithm) que garantiza libre de bucles y convergencia rapida. La metrica compuesta usa Bandwidth y Delay por defecto (K1=1, K3=1). Mantiene tabla de vecinos (hello/hold), tabla de topologia (sucesor y sucesor factible) y tabla de enrutamiento. El sucesor factible (FS) es un backup precomputado, activacion instantanea sin recalculo.',
        topology: {
          nodes: [
            { id: 'R1', label: 'R1', type: 'router', ip: 'AS 100', x: 0.15, y: 0.5, detail: ['Sucesor hacia R4: via R2', 'FS (backup): via R3', 'router eigrp 100'] },
            { id: 'R2', label: 'R2', type: 'router', ip: '10.12.0.2', x: 0.42, y: 0.25, detail: ['BW: 1Gbps', 'Delay: 10us', 'Metric = 256*(10^7/BW + delay/10)'] },
            { id: 'R3', label: 'R3', type: 'router', ip: '10.13.0.2', x: 0.42, y: 0.75, detail: ['BW: 100Mbps', 'Delay: 20us', 'Sucesor Factible de R1'] },
            { id: 'R4', label: 'R4', type: 'router', ip: '10.24.0.1', x: 0.75, y: 0.5, detail: ['Destino final', 'Red: 192.168.4.0/24'] },
          ],
          links: [
            { from: 'R1', to: 'R2', label: 'Sucesor', subnet: '10.12.0.0/30', color: '#198038' },
            { from: 'R1', to: 'R3', label: 'FS', subnet: '10.13.0.0/30', color: '#f1c21b', dashed: true },
            { from: 'R2', to: 'R4', subnet: '10.24.0.0/30', color: '#198038' },
            { from: 'R3', to: 'R4', subnet: '10.34.0.0/30', color: '#f1c21b', dashed: true },
          ],
          detail: 'router eigrp 100\n  eigrp router-id 1.1.1.1\n  network 10.0.0.0 0.255.255.255\n  no auto-summary\n  passive-interface default\n  no passive-interface G0/0\n\nshow ip eigrp neighbors\nshow ip eigrp topology          → tabla completa sucesor/FS\nshow ip eigrp topology all-links\ndebug eigrp packets',
        },
      },
      {
        step: 5,
        title: 'BGP — Border Gateway Protocol',
        svgIcon: JUNIPER_SVG,
        badge: { label: 'BGP', color: '#84bd00', logo: JUNIPER_SVG },
        description: 'BGP es el protocolo de enrutamiento entre sistemas autonomos (EGP) que sostiene el routing de internet. Usa TCP puerto 179. eBGP conecta AS distintos, iBGP conecta routers dentro del mismo AS. La metrica son los atributos de ruta: AS-PATH (loop prevention), NEXT-HOP, LOCAL-PREF (preferencia salida iBGP), MED (sugerencia entrada), WEIGHT (Cisco, local). La seleccion de ruta sigue un orden determinista: mayor Weight → mayor Local-Pref → ruta local → AS-PATH mas corto → menor MED → eBGP > iBGP → menor IGP metric → menor Router-ID.',
        topology: {
          nodes: [
            { id: 'AS1R', label: 'AS65001', type: 'router', ip: '1.1.1.1', x: 0.2, y: 0.45, color: '#0043ce', detail: ['neighbor 2.2.2.2 remote-as 65002', 'eBGP session', 'LOCAL-PREF default: 100'] },
            { id: 'AS2R', label: 'AS65002', type: 'router', ip: '2.2.2.2', x: 0.5, y: 0.45, color: '#da1e28', detail: ['eBGP con AS65001 y AS65003', 'Transit AS', 'AS-PATH: 65002 65001'] },
            { id: 'AS3R', label: 'AS65003', type: 'router', ip: '3.3.3.3', x: 0.8, y: 0.45, color: '#198038', detail: ['neighbor 2.2.2.2 remote-as 65002', 'eBGP session'] },
            { id: 'ISP', label: 'Internet', type: 'cloud', x: 0.5, y: 0.15, color: '#8a3ffc', detail: ['Tabla BGP global: ~900k prefijos'] },
          ],
          links: [
            { from: 'AS1R', to: 'AS2R', label: 'eBGP', subnet: '10.12.0.0/30', color: '#0043ce' },
            { from: 'AS2R', to: 'AS3R', label: 'eBGP', subnet: '10.23.0.0/30', color: '#da1e28' },
            { from: 'AS2R', to: 'ISP', label: 'upstream', color: '#8a3ffc', dashed: true },
          ],
          detail: 'router bgp 65001\n  bgp router-id 1.1.1.1\n  neighbor 2.2.2.2 remote-as 65002\n  neighbor 2.2.2.2 ebgp-multihop 2\n  network 203.0.113.0 mask 255.255.255.0\n\n! Filtrar con prefix-list:\nip prefix-list ALLOW-OUT permit 203.0.113.0/24\nroute-map OUT-FILTER permit 10\n  match ip address prefix-list ALLOW-OUT\nneighbor 2.2.2.2 route-map OUT-FILTER out\n\nshow bgp summary\nshow bgp ipv4 unicast\nshow bgp neighbors 2.2.2.2',
        },
      },
      {
        step: 6,
        title: 'ISAKMP / IKE — Protocolo de Intercambio de Claves',
        svgIcon: CISCO_SVG,
        badge: { label: 'ISAKMP/IKE', color: '#da1e28', logo: CISCO_SVG },
        description: `ISAKMP (Internet Security Association and Key Management Protocol, RFC 2408) define el framework para establecer, negociar, modificar y eliminar Security Associations (SA). IKE (Internet Key Exchange) es la implementacion de ISAKMP usando Oakley y SKEME.

IKEv1 opera en 2 fases:
FASE 1 — Establece canal seguro (ISAKMP SA):
  • Main Mode (6 mensajes): protege la identidad, mas seguro
  • Aggressive Mode (3 mensajes): revela identidad, mas rapido
  Parametros negociados: algoritmo de encriptacion (AES-256, 3DES), hash (SHA-256, MD5), metodo de autenticacion (PSK, RSA), grupo Diffie-Hellman (grupo 14=2048bit, 19=256bit EC), lifetime

FASE 2 — Establece IPsec SA (Quick Mode, 3 mensajes):
  Parametros: protocolo (ESP/AH), modo (Tunnel/Transport), algoritmo cifrado, PFS (Perfect Forward Secrecy)

IKEv2 (RFC 7296) simplifica a 2 intercambios: IKE_SA_INIT + IKE_AUTH, agrega EAP, MOBIKE, y mejor resiliencia.

ARP (Address Resolution Protocol, RFC 826):
  Resuelve direcciones IP → MAC en LAN. El host envia ARP Request (broadcast) con la IP destino. El dueno responde con ARP Reply (unicast) con su MAC. Entradas en cache ARP tienen TTL ~20 min.
  Gratuitous ARP: un host anuncia su propia IP (detecta conflictos, actualiza caches vecinas).
  ARP Spoofing/Poisoning: ataque que responde ARP falsos para interceptar trafico (MITM). Mitigacion: Dynamic ARP Inspection (DAI) en switches Cisco.`,
        topology: {
          nodes: [
            { id: 'SITE_A', label: 'Site A', type: 'router', ip: '200.1.1.1', x: 0.15, y: 0.45, color: '#0043ce', detail: ['crypto isakmp policy 10', 'encryption aes 256', 'hash sha256', 'group 14', 'lifetime 86400'] },
            { id: 'FW_A', label: 'FW-A', type: 'firewall', ip: 'NAT', x: 0.32, y: 0.45, color: '#da1e28', detail: ['Fase 1: IKE_SA_INIT', 'UDP 500 / 4500 (NAT-T)'] },
            { id: 'INET', label: 'Internet', type: 'cloud', x: 0.5, y: 0.45, color: '#8a3ffc', detail: ['Tunel ESP cifrado', 'Protocolo 50'] },
            { id: 'FW_B', label: 'FW-B', type: 'firewall', ip: 'NAT', x: 0.68, y: 0.45, color: '#da1e28', detail: ['Fase 2: IPsec SA', 'ESP Tunnel Mode'] },
            { id: 'SITE_B', label: 'Site B', type: 'router', ip: '200.2.2.1', x: 0.85, y: 0.45, color: '#198038', detail: ['crypto map VPN 10 ipsec-isakmp', 'set peer 200.1.1.1', 'set transform-set TS', 'match address VPN-ACL'] },
            { id: 'LAN_A', label: 'LAN-A', type: 'switch', ip: '192.168.1.0/24', x: 0.15, y: 0.8, color: '#24a148' },
            { id: 'LAN_B', label: 'LAN-B', type: 'switch', ip: '192.168.2.0/24', x: 0.85, y: 0.8, color: '#24a148' },
          ],
          links: [
            { from: 'SITE_A', to: 'FW_A', subnet: '' },
            { from: 'FW_A', to: 'INET', label: 'IKE UDP/500', color: '#f1c21b' },
            { from: 'INET', to: 'FW_B', label: 'ESP/AH', color: '#f1c21b' },
            { from: 'FW_B', to: 'SITE_B', subnet: '' },
            { from: 'SITE_A', to: 'LAN_A', subnet: '192.168.1.0/24' },
            { from: 'SITE_B', to: 'LAN_B', subnet: '192.168.2.0/24' },
          ],
          detail: '! IKEv1 Site-to-Site VPN Cisco IOS\ncrypto isakmp policy 10\n  encr aes 256\n  hash sha256\n  authentication pre-share\n  group 14\n  lifetime 86400\ncrypto isakmp key M1Clave! address 200.2.2.1\n\ncrypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac\n  mode tunnel\ncrypto map VPN 10 ipsec-isakmp\n  set peer 200.2.2.1\n  set transform-set TS\n  set pfs group14\n  match address VPN-ACL\ninterface G0/0\n  crypto map VPN\n\n! ARP\nshow arp\nclear arp-cache\nip arp inspection vlan 10   → DAI anti-spoofing',
        },
      },
    ],
  },
  {
    id: 'visor-reportes',
    icon: 'bar-chart-outline',
    title: 'Visor de Reportes de Campo',
    tagline: 'Dashboard de Excel en tiempo real',
    description:
      'Visualiza, filtra y analiza los reportes de campo generados por el asistente directamente desde la plataforma, sin necesidad de abrir Excel.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format&fit=crop',
    intro:
      'Accede a todos los registros de rendimiento, maquinaria e insumos desde cualquier dispositivo. Consulta tablas interactivas, aplica filtros por fecha o actividad y descarga reportes actualizados en segundos.',
    features: [
      { icon: 'bar-chart-outline', title: 'Tablas interactivas', text: 'Visualiza cada hoja del Excel con filtros, búsqueda y ordenamiento por columna.' },
      { icon: 'cloud-download-outline', title: 'Descarga directa', text: 'Descarga cualquier reporte en formato Excel con un solo toque.' },
      { icon: 'refresh-outline', title: 'Datos en tiempo real', text: 'Los reportes se actualizan automáticamente conforme el asistente registra nuevos datos.' },
    ],
    deliverables: [
      'Vista de Rendimiento Diario Jornal',
      'Vista de Maquinaria y combustible',
      'Vista de Insumos y costos',
      'Búsqueda y filtros por columna',
      'Descarga de archivos Excel',
    ],
    bullets: ['Tablas interactivas', 'Datos del chatbot', 'Descarga Excel'],
  },
  {
    id: 'consultoria',
    icon: 'bulb-outline',
    title: 'Consultoria y Estrategia',
    tagline: 'Implementacion y entrenamiento',
    description:
      'Diagnostico, implementacion y capacitacion para tu adopcion tecnologica.',
    image: IMAGES.aboutMeeting,
    intro:
      'Te acompanamos en la adopcion tecnologica de principio a fin: entendemos tu negocio, definimos un roadmap realista y capacitamos a tu equipo para sostener el cambio.',
    features: [
      { icon: 'clipboard-outline', title: 'Diagnostico', text: 'Analisis de tu operacion y oportunidades.' },
      { icon: 'map-outline', title: 'Roadmap', text: 'Plan tecnologico por etapas con prioridades claras.' },
      { icon: 'people-outline', title: 'Entrenamiento', text: 'Capacitacion practica para tu equipo.' },
    ],
    deliverables: [
      'Diagnostico y oportunidades',
      'Roadmap tecnologico',
      'Acompanamiento en la implementacion',
      'Capacitacion del equipo',
    ],
    bullets: ['Diagnostico inicial', 'Roadmap tecnologico', 'Entrenamiento'],
  },
];

// Busca un servicio por id (para la pagina de detalle).
export const getService = (id) => SERVICES.find((s) => s.id === id);

// Seccion "Recomendado para usted" (tarjetas con etiqueta de tipo).
export const RECOMMENDED = [
  {
    id: 'r1',
    tag: 'Prueba gratuita',
    title: 'Experimenta el poder de la automatizacion con IA durante 30 dias',
  },
  {
    id: 'r2',
    tag: 'Webinar',
    title: 'Como elegir la nube adecuada sin sacrificar control ni rendimiento',
  },
  {
    id: 'r3',
    tag: 'Informe',
    title: 'Transformacion digital para PYMES: metricas que importan en 2026',
  },
];

// Lista de "productos".
export const PRODUCTS = [
  'BuildWise Flows',
  'BuildWise Assistant',
  'BuildWise Chat',
  'BuildWise Analytics',
  'BuildWise Secure',
  'BuildWise Connect',
  'BuildWise Consulting',
];

// Casos de exito con metrica destacada.
export const CASES = [
  {
    id: 'c1',
    metric: '~90%',
    text: 'de entrega mas rapida automatizando procesos manuales.',
  },
  {
    id: 'c2',
    metric: '10x',
    text: 'mas rapido en el despliegue de nuevas aplicaciones.',
  },
  {
    id: 'c3',
    metric: '+40',
    text: 'proyectos entregados para PYMES en Latinoamerica.',
  },
];
