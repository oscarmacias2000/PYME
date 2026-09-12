import XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { existsSync } from 'fs';

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

// ─── Encabezados por categoría ─────────────────────────────────────────────
const HEADERS = {
  maquinaria:  ['fecha','equipo','implemento','tipo_combustible','actividad','ubicacion','huerta','responsable','litros','precio_litro','costo_total','avance_ha','observaciones'],
  rendimiento: ['fecha','actividad','ubicacion','huerta','responsable','num_personas','cantidad_realizada','unidad_medida','meta_jornal','margen','pct_cumplimiento','incidencia','motivo_incidencia','observaciones'],
  insumos:     ['fecha','recurso','cantidad','unidad_medida','motivo_uso','actividad','huerta','costo_unitario','costo_total','responsable'],
  resumen:     ['semana_del','al','actividad','huerta','responsable','total_personas','total_cantidad','unidad','observaciones'],
};

const SHEET_NAMES = {
  maquinaria:  'Maquinaria',
  rendimiento: 'Rendimiento Diario Jornal',
  insumos:     'Insumos',
  resumen:     'Resumen Semanal',
};

// ─── Colores por categoría ──────────────────────────────────────────────────
const COLORS = {
  maquinaria:  { title: '1A3A5C', header: '1F618D', alt: 'D6EAF8', accent: '2E86C1' },
  rendimiento: { title: '145A32', header: '1E8449', alt: 'D5F5E3', accent: '27AE60' },
  insumos:     { title: '6E2F0A', header: '922B21', alt: 'FADBD8', accent: 'E74C3C' },
  resumen:     { title: '4A235A', header: '7D3C98', alt: 'E8DAEF', accent: '9B59B6' },
};

const LABELS = {
  maquinaria:  ['Fecha','Equipo','Implemento','Tipo Comb.','Actividad','Ubicación','Huerta','Responsable','Litros','Precio/L','Costo Total','Avance (ha)','Observaciones'],
  rendimiento: ['Fecha','Actividad','Ubicación','Huerta','Responsable','N° Personas','Cantidad','Unidad','Meta Jornal','Margen','% Cumpl.','Incidencia','Motivo Inc.','Observaciones'],
  insumos:     ['Fecha','Recurso/Insumo','Cantidad','Unidad','Motivo de Uso','Actividad','Huerta','Costo Unit.','Costo Total','Responsable'],
  resumen:     ['Semana Del','Al','Actividad','Huerta','Responsable','Total Personas','Total Cantidad','Unidad','Observaciones'],
};

// Agrega una fila al reporte diario de campo con estilos Excel completos
async function appendToFieldReport(categoria, datos, outputPath) {
  const headers = HEADERS[categoria];
  const sheetName = SHEET_NAMES[categoria];
  const labels  = LABELS[categoria];
  const pal     = COLORS[categoria] || COLORS.rendimiento;
  if (!headers || !sheetName) { console.error('[appendToFieldReport] categoria inválida:', categoria); return; }

  const fecha   = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const newRow  = headers.map(h => datos[h] ?? '');
  console.log('[appendToFieldReport] fila:', newRow);

  // ── Leer filas existentes (sin encabezados decorativos) ─────────────────
  let existingRows = [];
  if (existsSync(outputPath)) {
    try {
      const wbOld = new ExcelJS.Workbook();
      await wbOld.xlsx.readFile(outputPath);
      const wsOld = wbOld.getWorksheet(sheetName);
      if (wsOld) {
        wsOld.eachRow((row, i) => {
          if (i > 3) existingRows.push(row.values.slice(1)); // skip title+header rows
        });
      }
    } catch {}
  }

  // ── Crear workbook con estilos ───────────────────────────────────────────
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Chatbot PYME';
  wb.created  = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 3 }] });

  // Ancho de columnas
  ws.columns = labels.map((l, i) => ({
    key: headers[i],
    width: Math.max(l.length + 4, 16),
  }));

  // ── Fila 1: Título ────────────────────────────────────────────────────────
  ws.mergeCells(1, 1, 1, headers.length);
  const titleCell = ws.getCell('A1');
  titleCell.value = `PYME Agrícola — ${sheetName}`;
  titleCell.font  = { bold: true, size: 14, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
  titleCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pal.title } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // ── Fila 2: Subtítulo ─────────────────────────────────────────────────────
  ws.mergeCells(2, 1, 2, headers.length);
  const subCell = ws.getCell('A2');
  subCell.value = `Generado: ${fecha}`;
  subCell.font  = { italic: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
  subCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pal.accent } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(2).height = 18;

  // ── Fila 3: Encabezados de columna ────────────────────────────────────────
  const headerRow = ws.addRow(labels);
  headerRow.height = 20;
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + pal.header } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } } };
  });

  // ── Filas de datos existentes ─────────────────────────────────────────────
  const allRows = [...existingRows, newRow];
  allRows.forEach((rowData, idx) => {
    const row = ws.addRow(rowData);
    const isAlt = idx % 2 === 1;
    row.height = 17;
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: isAlt ? ('FF' + pal.alt) : 'FFFFFFFF' } };
      cell.font      = { size: 10, name: 'Calibri', color: { argb: 'FF1A1A1A' } };
      cell.alignment = { vertical: 'middle' };
      cell.border    = {
        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
        right:  { style: 'thin', color: { argb: 'FFD0D0D0' } },
      };
    });
  });

  // Filtros automáticos en encabezados
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: headers.length } };

  await wb.xlsx.writeFile(outputPath);
}

export { processExcel, generateResultExcel, appendToFieldReport };
