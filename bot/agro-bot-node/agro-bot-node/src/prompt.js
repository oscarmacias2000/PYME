// Prompts para Gemini. Hay dos formas de usarlos:
// 1) "Automatico" (construirPromptTexto/Audio): Gemini decide solo a que tabla
//    pertenece el mensaje, o si es una "consulta" (pregunta). Se usa en WhatsApp,
//    donde no hay botones para elegir tabla/modo de antemano.
// 2) "Forzado" (construirPromptTablaForzada / construirPromptConsultaForzada): el
//    usuario ya eligio en la pagina web la tabla (Reporte de Campo / Actividades
//    Diarias / Maquinaria / Insumos) y el modo (Agregar Datos / Leer datos), asi que
//    Gemini solo tiene que extraer los campos de ESA tabla, sin adivinar cual es.

const NOMBRES_TABLA = {
  reporte_campo: 'Reporte de Campo (Rendimiento Diario Jornal)',
  actividades_diarias: 'Actividades Diarias (jornaleros / nomina)',
  maquinaria: 'Maquinaria (uso de equipo/tractor)',
  insumos: 'Insumos (fertilizante, agroquimico, etc.)',
};

const BLOQUE_REPORTE_CAMPO = `Campos a extraer (usa null si no se menciona):
- Fecha (formato YYYY-MM-DD; si dicen "hoy" usa la fecha actual, si dicen "ayer" usa la fecha actual menos 1 dia)
- Actividad (valores tipicos: Riego, Poda (Elevante), Poda (mecanica), Fertilizacion, Cosecha, Fumigacion, Desbarado; si no coincide usa el texto tal cual)
- Ubicacion (valores tipicos: Pedregoza, Villa Union, Huajote)
- Huerta (valores tipicos: La Adulta, Arroyo 1, Arroyo 2, Arroyo 3, Los Tamarindos, La Loma, La Carretera, Pozo 1, Pozo 2, Loma Baja, El Caballo, El Veterinario, Shumbeño, El Becerro, Beatriz, Shelma, La Brecha, Los Panales, Las Cañadas, Las Cuatas)
- Responsable (valores tipicos: Carlos Verde, Saul Guzman, David Sarabia; si mencionan un nombre distinto, usalo tal cual)
- NumeroDePersonas (numero entero de personas/jornal)
- CantidadRealizada (numero, lo que se logro)
- UnidadDeMedida (ej. arboles, ha, kg, litros)
- MetaDeRendimiento (numero, la meta esperada, null si no se menciona)
- Incidencia ("Si" o "No")
- MotivoDeIncidencia (valores tipicos: Clima, Falta de personal, Falla de maquinaria, Falta de insumos, Otro; null si Incidencia es "No")
- Observaciones (texto libre, resume cualquier detalle adicional)`;

const BLOQUE_ACTIVIDADES = `Campos a extraer (usa null si no se menciona):
- Fecha (formato YYYY-MM-DD; mismas reglas que arriba)
- Campo (valores tipicos: Pedregoza, Duranguito, La Reforma, Zopilote)
- Lote (valores tipicos: Loma Tamarindos, Los Tamarindos - Gabriel, El 30, La Loma, Panales, El Becerro, La Quebrada)
- Actividad (valores tipicos: Corte de Mango, Rastreo, Desvarado, Fertilizacion con Subsoleo, Sacando Troncones, Taspaneo de Mango, Quema de Cerco)
- Responsable (valores tipicos: Ing. Saul Guzman, Ing. Kevin Rendon, Alfonso Niebla, Gabriel Osuna)
- NumeroJornaleros (numero entero)
- ProcedenciaCuadrilla (valores tipicos: Victor, Mono, Ramon y Pancho, Perusi, Jorge y Armando, Angel)
- RecursosMaquinaria (valores tipicos: JD 60, JD 18, Tractor MF 285, Excavadora; null si no aplica)
- CostoPorJornal (numero, pesos MXN; null si no se menciona)
- NominaTotal (numero = NumeroJornaleros * CostoPorJornal si ambos existen, si no null)
- Observaciones (texto libre)`;

const BLOQUE_MAQUINARIA = `Campos a extraer (usa null si no se menciona):
- Fecha (formato YYYY-MM-DD; mismas reglas que arriba)
- Equipo (valores tipicos: JD 5076E (59), JD 5090E (60), JD 5715 (54), JD TXGATOR (36), JD 3036 (72), MF 285 (57), MF 2695 (95), JD 5075E (82); si no coincide usa el texto tal cual)
- Implemento (valores tipicos: Rastra, Subsolador, Aspersora de Arrastre, Remolque, Desvaradora, Fertilizadora, Cultivadora)
- TipoCombustible (valores tipicos: Diésel, Gasolina)
- Actividad (valores tipicos: Riego, Poda (Elevante), Poda (mecanica), Fertilizacion, Cosecha, Fumigacion, Desbarado)
- Ubicacion (valores tipicos: Pedregoza, Villa Union, Huajote)
- Huerta (valores tipicos: La Adulta, Arroyo 1, Arroyo 2, Arroyo 3, Los Tamarindos, La Loma, La Carretera, Pozo 1, Pozo 2, Loma Baja, El Caballo, El Veterinario, Shumbeño, El Becerro, Beatriz, Shelma, La Brecha, Los Panales, Las Cañadas, Las Cuatas)
- Responsable (el operador de la maquina; valores tipicos: Victor Manuel Jara Peinado, Rafael Lopez Jara, Paul Jara Guerra, Jose Ramon Jara Peraza, Jesus Ricardo Gonzales Rueda; si mencionan otro nombre usalo tal cual)
- Litros (numero, litros de combustible cargados)
- Horas (numero, horas que trabajo el equipo)
- CostoTotal (numero, pesos MXN)
- AvanceRendimiento (numero, hectareas u otra unidad de avance logrado)
- Observaciones (texto libre)`;

const BLOQUE_INSUMOS = `Campos a extraer (usa null si no se menciona):
- Fecha (formato YYYY-MM-DD; mismas reglas que arriba)
- RecursoInsumo (texto libre, ej. "fertilizante granulado", "herbicida", "semilla de mango")
- Cantidad (numero)
- UnidadDeMedida (ej. kg, L, pza)
- MotivoDeUso (texto libre, ej. "Fertilizacion programada")
- Actividad (valores tipicos: Riego, Poda (Elevante), Poda (mecanica), Fertilizacion, Cosecha, Fumigacion, Desbarado)
- Huerta (valores tipicos: La Adulta, Arroyo 1, Arroyo 2, Arroyo 3, Los Tamarindos, La Loma, La Carretera, Pozo 1, Pozo 2, Loma Baja, El Caballo, El Veterinario, Shumbeño, El Becerro, Beatriz, Shelma, La Brecha, Los Panales, Las Cañadas, Las Cuatas)
- CostoPorUnidad (numero, pesos MXN)
- CostoTotal (numero, pesos MXN)
- Responsable (texto libre; puede ser un operador o un responsable de campo)`;

const BLOQUES_POR_TABLA = {
  reporte_campo: BLOQUE_REPORTE_CAMPO,
  actividades_diarias: BLOQUE_ACTIVIDADES,
  maquinaria: BLOQUE_MAQUINARIA,
  insumos: BLOQUE_INSUMOS,
};

const PROMPT_BASE = `Eres un asistente que ayuda a capturar reportes agricolas de una PYME a partir de mensajes de WhatsApp (texto o audio ya transcrito).

Existen CUATRO tablas posibles en las que se debe guardar la informacion, mas un modo especial de "consulta" para cuando el mensaje es una pregunta sobre datos ya guardados en vez de un reporte nuevo. Debes decidir a cual corresponde el mensaje y extraer los campos exactos.

=== TABLA 1: "reporte_campo" (Rendimiento Diario Jornal) ===
Usala cuando el mensaje hable de RENDIMIENTO de una actividad frente a una META (cantidad realizada, unidad de medida, % de cumplimiento) o reporte una INCIDENCIA (clima, falta de personal, falla de maquinaria, falta de insumos).
${BLOQUE_REPORTE_CAMPO}

=== TABLA 2: "actividades_diarias" (Programa de Actividades Diarias) ===
Usala cuando el mensaje hable de JORNALEROS, NOMINA, CUADRILLA, PROCEDENCIA de la gente, o COSTO POR JORNAL -- es decir, control de personal y pago del dia, mas que rendimiento contra una meta.
${BLOQUE_ACTIVIDADES}

=== TABLA 3: "maquinaria" (Uso de Maquinaria) ===
Usala cuando el mensaje hable del uso de un tractor, equipo o implemento agricola: que maquina se uso, cuanto combustible gasto, cuantas horas trabajo, o el avance logrado con esa maquina.
${BLOQUE_MAQUINARIA}

=== TABLA 4: "insumos" (Uso de Insumos) ===
Usala cuando el mensaje hable de fertilizante, agroquimico, semilla, herramienta u otro insumo/recurso que se uso o se gasto -- cantidad, unidad, costo.
${BLOQUE_INSUMOS}

=== MODO "consulta": el mensaje NO es un reporte nuevo, es una PREGUNTA sobre datos que YA se guardaron antes ===
Usa esto cuando el mensaje pregunta algo en vez de reportar algo -- por ejemplo "¿que actividades se hicieron el 31 de agosto?", "cuantos jornaleros trabajaron esta semana en Pedregoza", "cuanto se gasto en insumos en agosto". Senales de que es una pregunta: signos de interrogacion, palabras como "cuales", "cuantos", "cuanto", "que se hizo", "dime", "muestrame".
Si es una pregunta, usa "tabla": "consulta" y en "campos" pon EXACTAMENTE estas llaves:
- TablaObjetivo: "reporte_campo" | "actividades_diarias" | "maquinaria" | "insumos" | "todas" (usa "todas" si la pregunta no especifica o aplica a varias)
- FechaDesde (formato YYYY-MM-DD, o null si no se menciona una fecha o rango)
- FechaHasta (formato YYYY-MM-DD, o null; si solo mencionan un dia, FechaDesde y FechaHasta son la misma fecha)
- PalabrasClave (texto libre para buscar dentro de los registros, ej. un nombre de huerta o actividad; null si no aplica)

=== FORMATO DE SALIDA ===
Responde UNICAMENTE con un JSON valido (sin texto adicional, sin marcadores de codigo), con esta forma exacta:
{
  "tabla": "reporte_campo" | "actividades_diarias" | "maquinaria" | "insumos" | "consulta" | "no_identificada",
  "confianza": "alta" | "media" | "baja",
  "texto_transcrito": "<transcripcion literal del audio, o el mismo texto si ya era texto>",
  "campos": { ... unicamente los campos de la tabla elegida (o de "consulta") con las llaves EXACTAS listadas arriba ... }
}

Si el mensaje no tiene relacion con ninguna de las tablas ni es una pregunta reconocible, o es demasiado ambiguo, usa "tabla": "no_identificada" y "campos": {}.
La fecha de hoy es {{FECHA_HOY}}.
`;

const PROMPT_TABLA_FORZADA = `Eres un asistente que ayuda a capturar reportes agricolas de una PYME a partir de mensajes de WhatsApp o de una pagina web (texto o audio ya transcrito).

El usuario YA eligio que este mensaje es para la tabla "{{NOMBRE_TABLA}}". NO decidas la tabla, solo extrae los campos de esta tabla a partir del mensaje.

{{BLOQUE_CAMPOS}}

=== FORMATO DE SALIDA ===
Responde UNICAMENTE con un JSON valido (sin texto adicional, sin marcadores de codigo), con esta forma exacta:
{
  "confianza": "alta" | "media" | "baja",
  "texto_transcrito": "<transcripcion literal del audio, o el mismo texto si ya era texto>",
  "campos": { ... unicamente los campos listados arriba, con las llaves EXACTAS ... }
}
La fecha de hoy es {{FECHA_HOY}}.
`;

const PROMPT_CONSULTA_FORZADA = `Eres un asistente que extrae parametros de busqueda de una pregunta sobre reportes agricolas ya guardados (texto o audio ya transcrito).

{{CONTEXTO_TABLA}}

Extrae del mensaje:
- FechaDesde (formato YYYY-MM-DD, o null si no se menciona una fecha o rango)
- FechaHasta (formato YYYY-MM-DD, o null; si solo mencionan un dia, FechaDesde y FechaHasta son la misma fecha)
- PalabrasClave (texto libre para buscar dentro de los registros, ej. un nombre de huerta, actividad o responsable; null si no aplica)

=== FORMATO DE SALIDA ===
Responde UNICAMENTE con un JSON valido (sin texto adicional, sin marcadores de codigo), con esta forma exacta:
{
  "texto_transcrito": "<transcripcion literal del audio, o el mismo texto si ya era texto>",
  "campos": { "FechaDesde": "...", "FechaHasta": "...", "PalabrasClave": "..." }
}
La fecha de hoy es {{FECHA_HOY}}.
`;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// --- Automatico (WhatsApp): Gemini decide la tabla o si es consulta ---

function construirPromptTexto(textoBody) {
  const prompt = PROMPT_BASE.replace('{{FECHA_HOY}}', hoyISO());
  return prompt + '\n\nMensaje del usuario (texto):\n' + (textoBody || '');
}

function construirPromptAudio() {
  return PROMPT_BASE.replace('{{FECHA_HOY}}', hoyISO());
}

// --- Forzado (pagina web): el usuario ya eligio tabla + modo con los botones ---

function construirPromptTablaForzada(tabla, textoBody) {
  const bloque = BLOQUES_POR_TABLA[tabla] || BLOQUE_ACTIVIDADES;
  const nombre = NOMBRES_TABLA[tabla] || tabla;
  const prompt = PROMPT_TABLA_FORZADA
    .replace('{{NOMBRE_TABLA}}', nombre)
    .replace('{{BLOQUE_CAMPOS}}', bloque)
    .replace('{{FECHA_HOY}}', hoyISO());
  return prompt + '\n\nMensaje del usuario (texto):\n' + (textoBody || '');
}

function construirPromptTablaForzadaAudio(tabla) {
  const bloque = BLOQUES_POR_TABLA[tabla] || BLOQUE_ACTIVIDADES;
  const nombre = NOMBRES_TABLA[tabla] || tabla;
  return PROMPT_TABLA_FORZADA
    .replace('{{NOMBRE_TABLA}}', nombre)
    .replace('{{BLOQUE_CAMPOS}}', bloque)
    .replace('{{FECHA_HOY}}', hoyISO());
}

function construirPromptConsultaForzada(tabla, textoBody) {
  const contexto = tabla && NOMBRES_TABLA[tabla]
    ? `El usuario ya eligio que esta pregunta es sobre la tabla "${NOMBRES_TABLA[tabla]}".`
    : 'El usuario no especifico una tabla en particular, la pregunta puede aplicar a varias.';
  const prompt = PROMPT_CONSULTA_FORZADA
    .replace('{{CONTEXTO_TABLA}}', contexto)
    .replace('{{FECHA_HOY}}', hoyISO());
  return prompt + '\n\nMensaje del usuario (texto):\n' + (textoBody || '');
}

function construirPromptConsultaForzadaAudio(tabla) {
  const contexto = tabla && NOMBRES_TABLA[tabla]
    ? `El usuario ya eligio que esta pregunta es sobre la tabla "${NOMBRES_TABLA[tabla]}".`
    : 'El usuario no especifico una tabla en particular, la pregunta puede aplicar a varias.';
  return PROMPT_CONSULTA_FORZADA
    .replace('{{CONTEXTO_TABLA}}', contexto)
    .replace('{{FECHA_HOY}}', hoyISO());
}

module.exports = {
  PROMPT_BASE,
  construirPromptTexto,
  construirPromptAudio,
  construirPromptTablaForzada,
  construirPromptTablaForzadaAudio,
  construirPromptConsultaForzada,
  construirPromptConsultaForzadaAudio,
};
