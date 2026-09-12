import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

const TABS = {
  maquinaria: {
    name: 'Maquinaria',
    cols: ['fecha','equipo','implemento','tipo_combustible','actividad','ubicacion','huerta','responsable','litros','precio_litro','costo_total','avance_ha','observaciones'],
  },
  rendimiento: {
    name: 'Rendimiento Diario Jornal',
    cols: ['fecha','actividad','ubicacion','huerta','responsable','num_personas','cantidad_realizada','unidad_medida','meta_jornal','margen','pct_cumplimiento','incidencia','motivo_incidencia','observaciones'],
  },
  insumos: {
    name: 'Insumos',
    cols: ['fecha','recurso','cantidad','unidad_medida','motivo_uso','actividad','huerta','costo_unitario','costo_total','responsable'],
  },
  resumen: {
    name: 'Resumen Semanal',
    cols: ['semana_del','al','actividad','huerta','responsable','total_personas','total_cantidad','unidad','observaciones'],
  },
};

const HEADERS = {
  maquinaria:   ['Fecha','Equipo','Implemento','Tipo Comb.','Actividad','Ubicación','Huerta','Responsable','Litros','Precio/L','Costo Total','Avance/Rendim. (ha)','Observaciones'],
  rendimiento:  ['Fecha','Actividad','Ubicación','Huerta','Responsable','N° de Personas','Cantidad Realizada','Unidad de Medida','Meta (jornal)','Margen (Real-Meta)','% Cumplimiento','¿Incidencia?','Motivo de Incidencia','Observaciones'],
  insumos:      ['Fecha','Recurso / Insumo','Cantidad','Unidad de Medida','Motivo de Uso','Actividad','Huerta','Costo por Unidad','Costo Total','Responsable'],
  resumen:      ['Semana del','Al','Actividad','Huerta','Responsable','Total Personas','Total Cantidad','Unidad','Observaciones'],
};

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT no configurado');
  const credentials = JSON.parse(raw.replace(/^'|'$/g, ''));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function guardarFila(categoria, datos) {
  const tab = TABS[categoria];
  if (!tab) throw new Error(`Categoría desconocida: ${categoria}`);
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEET_ID no configurado');

  const auth   = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const fila   = tab.cols.map(col => datos[col] ?? '');

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${tab.name}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [fila] },
  });

  return { tab: tab.name, fila };
}

export async function inicializarHojas() {
  if (!SPREADSHEET_ID) {
    console.warn('⚠ Google Sheets no configurado — registro desactivado');
    return;
  }
  try {
    const auth   = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const { data } = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existentes = data.sheets.map(s => s.properties.title);

    const faltantes = Object.values(TABS)
      .filter(t => !existentes.includes(t.name))
      .map(t => ({ addSheet: { properties: { title: t.name } } }));

    if (faltantes.length) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests: faltantes },
      });
    }

    for (const [key, tab] of Object.entries(TABS)) {
      if (!existentes.includes(tab.name)) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${tab.name}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [HEADERS[key]] },
        });
      }
    }

    console.log('✓ Google Sheets inicializado');
  } catch (err) {
    console.error('Error inicializando Sheets:', err.message);
  }
}
