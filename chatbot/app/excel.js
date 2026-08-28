import XLSX from 'xlsx';

// Detecta qué columnas del Excel corresponden a cada dato
function detectColumns(headers) {
  const patterns = {
    fecha:    /fecha|date|d[íi]a/i,
    vehiculo: /veh[íi]culo|unidad|auto|carro|placa|coche|camion/i,
    litros:   /litros?|lts?|cantidad|volumen/i,
    precio:   /precio|costo.?litro|p\/l/i,
    total:    /total|importe|monto|gasto/i,
    km:       /km|kil[oó]metros?|distancia|odometro/i,
  };
  const map = {};
  for (const h of headers) {
    for (const [key, re] of Object.entries(patterns)) {
      if (!map[key] && re.test(h)) map[key] = h;
    }
  }
  return map;
}

function parseNum(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v.replace(/[,$\s]/g, '')) || 0;
  return 0;
}

function parseExcelDate(v) {
  if (!v) return null;
  if (typeof v === 'number') {
    // número de serie de Excel
    const d = XLSX.SSF.parse_date_code(v);
    return d ? new Date(d.y, d.m - 1, d.d) : null;
  }
  if (typeof v === 'string') {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
}

function fmt(d) {
  if (!d) return 'Sin fecha';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function weekKey(d) {
  if (!d) return 'Sin fecha';
  // Semana del año
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `Semana ${week} - ${d.getFullYear()}`;
}

function groupBy(arr, fn) {
  return arr.reduce((acc, r) => {
    const k = fn(r);
    (acc[k] = acc[k] || []).push(r);
    return acc;
  }, {});
}

function sum(arr, field) {
  return arr.reduce((s, r) => s + (r[field] || 0), 0);
}

// ─── Procesamiento principal ────────────────────────────────────────────────
function processExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

  if (!raw.length) return null;

  const headers = Object.keys(raw[0]);
  const cols = detectColumns(headers);

  const rows = raw.map(r => {
    const litros = parseNum(r[cols.litros]);
    const precio  = parseNum(r[cols.precio]);
    const total   = cols.total ? parseNum(r[cols.total]) : litros * precio;
    const fecha   = parseExcelDate(r[cols.fecha]);

    return {
      ...r,
      _litros:   litros,
      _precio:   precio,
      _total:    total,
      _fecha:    fecha,
      _vehiculo: (cols.vehiculo ? r[cols.vehiculo] : null) || 'General',
      _fmtFecha: fmt(fecha),
      _semana:   weekKey(fecha),
    };
  });

  const grandTotal   = sum(rows, '_total');
  const totalLitros  = sum(rows, '_litros');
  const dias         = new Set(rows.map(r => r._fmtFecha)).size;
  const semanas      = new Set(rows.map(r => r._semana)).size;

  const byDay     = groupBy(rows, r => r._fmtFecha);
  const byWeek    = groupBy(rows, r => r._semana);
  const byVehicle = groupBy(rows, r => r._vehiculo);

  const dailySummary = Object.entries(byDay).map(([day, items]) => ({
    Fecha:          day,
    'Litros':       +sum(items, '_litros').toFixed(2),
    'Gasto ($)':    +sum(items, '_total').toFixed(2),
  }));

  const weeklySummary = Object.entries(byWeek).map(([week, items]) => ({
    Semana:         week,
    'Litros':       +sum(items, '_litros').toFixed(2),
    'Gasto ($)':    +sum(items, '_total').toFixed(2),
  }));

  const vehicleSummary = Object.entries(byVehicle).map(([v, items]) => ({
    'Vehículo/Unidad': v,
    'Litros':       +sum(items, '_litros').toFixed(2),
    'Gasto ($)':    +sum(items, '_total').toFixed(2),
  }));

  return {
    cols,
    summary: {
      grandTotal:       +grandTotal.toFixed(2),
      totalLitros:      +totalLitros.toFixed(2),
      totalDias:        dias,
      promedioDiario:   +(grandTotal / (dias || 1)).toFixed(2),
      promedioSemanal:  +(grandTotal / (semanas || 1)).toFixed(2),
    },
    dailySummary,
    weeklySummary,
    vehicleSummary,
    rawData: raw,
    headers,
  };
}

// ─── Genera el Excel de resultados ─────────────────────────────────────────
function generateResultExcel(data, outputPath) {
  const wb = XLSX.utils.book_new();

  // Hoja 1: Resumen general
  const resumen = [
    ['Concepto', 'Valor'],
    ['Gasto total combustible', `$${data.summary.grandTotal}`],
    ['Total litros consumidos', data.summary.totalLitros],
    ['Días registrados', data.summary.totalDias],
    ['Promedio diario', `$${data.summary.promedioDiario}`],
    ['Promedio semanal', `$${data.summary.promedioSemanal}`],
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
  wsResumen['!cols'] = [{ wch: 30 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

  // Hoja 2: Por día
  if (data.dailySummary.length) {
    const wsDay = XLSX.utils.json_to_sheet(data.dailySummary);
    wsDay['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsDay, 'Por Día');
  }

  // Hoja 3: Por semana
  if (data.weeklySummary.length) {
    const wsWeek = XLSX.utils.json_to_sheet(data.weeklySummary);
    wsWeek['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsWeek, 'Por Semana');
  }

  // Hoja 4: Por vehículo
  if (data.vehicleSummary.length) {
    const wsVeh = XLSX.utils.json_to_sheet(data.vehicleSummary);
    wsVeh['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsVeh, 'Por Vehículo');
  }

  // Hoja 5: Datos originales
  const wsRaw = XLSX.utils.json_to_sheet(data.rawData);
  XLSX.utils.book_append_sheet(wb, wsRaw, 'Datos Originales');

  XLSX.writeFile(wb, outputPath);
}

export { processExcel, generateResultExcel };
