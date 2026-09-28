import {
  View, Text, Pressable, ScrollView, ActivityIndicator,
  FlatList, TextInput, Platform,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/ui/Screen';

const API_BASE = 'https://chat.buildwiselabs.duckdns.org';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(val) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    const [y, m, d] = val.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
  if (typeof val === 'number') return val % 1 === 0 ? String(val) : val.toFixed(2);
  return String(val);
}

// ─── Componente: celda de cabecera ────────────────────────────────────────────

function Th({ children, width = 130 }) {
  return (
    <View style={{ width, paddingHorizontal: 10, paddingVertical: 8,
                   backgroundColor: '#1a472a', borderRightWidth: 1, borderRightColor: '#2d6a4f' }}>
      <Text numberOfLines={2}
            style={{ color: '#95d5b2', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>
        {children}
      </Text>
    </View>
  );
}

// ─── Componente: celda de dato ────────────────────────────────────────────────

function Td({ children, width = 130, even }) {
  return (
    <View style={{ width, paddingHorizontal: 10, paddingVertical: 8,
                   backgroundColor: even ? '#1e2a20' : '#232b25',
                   borderRightWidth: 1, borderRightColor: '#2d3a2e' }}>
      <Text numberOfLines={2} style={{ color: '#e0e0e0', fontSize: 12 }}>
        {children}
      </Text>
    </View>
  );
}

// ─── Componente: tabla de una hoja ────────────────────────────────────────────

function SheetTable({ columnas, filas }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? filas.filter(row =>
        row.some(v => fmt(v).toLowerCase().includes(query.toLowerCase()))
      )
    : filas;

  const colWidth = 140;

  if (!columnas.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#666' }}>Sin datos en esta hoja</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Búsqueda */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8,
                     paddingHorizontal: 12, paddingVertical: 8,
                     backgroundColor: '#1a1a1a', borderBottomWidth: 1, borderBottomColor: '#2d3a2e' }}>
        <Ionicons name="search-outline" size={16} color="#74c69d" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar en la hoja…"
          placeholderTextColor="#555"
          style={{ flex: 1, color: '#e0e0e0', fontSize: 13, ...(Platform.OS === 'web' && { outlineStyle: 'none' }) }}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={16} color="#555" />
          </Pressable>
        ) : null}
        <Text style={{ color: '#555', fontSize: 11 }}>{filtered.length} filas</Text>
      </View>

      {/* Tabla con scroll horizontal + vertical */}
      <ScrollView horizontal style={{ flex: 1 }}>
        <View>
          {/* Cabecera */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#2d6a4f' }}>
            {columnas.map((c, i) => <Th key={i} width={colWidth}>{c}</Th>)}
          </View>

          {/* Filas */}
          <FlatList
            data={filtered}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: row, index }) => (
              <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a3a2c' }}>
                {columnas.map((_, ci) => (
                  <Td key={ci} width={colWidth} even={index % 2 === 0}>
                    {fmt(row[ci])}
                  </Td>
                ))}
              </View>
            )}
            getItemLayout={(_, i) => ({ length: 40, offset: 40 * i, index: i })}
            maxToRenderPerBatch={30}
            windowSize={10}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Componente: selector de hoja (tabs) ─────────────────────────────────────

function SheetTabs({ names, active, onSelect }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#2d3a2e' }}
                contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 4 }}>
      {names.map(name => {
        const sel = name === active;
        return (
          <Pressable key={name} onPress={() => onSelect(name)}
                     style={{ paddingHorizontal: 16, paddingVertical: 12,
                              borderBottomWidth: 2,
                              borderBottomColor: sel ? '#52b788' : 'transparent' }}>
            <Text style={{ color: sel ? '#52b788' : '#888', fontWeight: sel ? '600' : '400', fontSize: 13 }}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function ReportesScreen({ navigation }) {
  const [archivos, setArchivos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [errorLista, setErrorLista] = useState(null);

  const [archivoSel, setArchivoSel] = useState(null);
  const [hojas, setHojas] = useState(null);
  const [loadingHojas, setLoadingHojas] = useState(false);
  const [errorHojas, setErrorHojas] = useState(null);
  const [hojaActiva, setHojaActiva] = useState(null);

  // Cargar lista de archivos
  const fetchLista = useCallback(async () => {
    setLoadingLista(true);
    setErrorLista(null);
    try {
      const r = await fetch(`${API_BASE}/api/reportes/lista`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setArchivos(j.archivos);
    } catch (e) {
      setErrorLista(e.message);
    } finally {
      setLoadingLista(false);
    }
  }, []);

  useEffect(() => { fetchLista(); }, [fetchLista]);

  // Cargar hojas de un archivo
  const fetchHojas = useCallback(async (nombre) => {
    setArchivoSel(nombre);
    setHojas(null);
    setHojaActiva(null);
    setLoadingHojas(true);
    setErrorHojas(null);
    try {
      const r = await fetch(`${API_BASE}/api/reportes/sheets?nombre=${encodeURIComponent(nombre)}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setHojas(j.hojas);
      setHojaActiva(Object.keys(j.hojas)[0] ?? null);
    } catch (e) {
      setErrorHojas(e.message);
    } finally {
      setLoadingHojas(false);
    }
  }, []);

  // ── Vista: lista de archivos ───────────────────────────────────────────────
  const renderLista = () => {
    if (loadingLista) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color="#52b788" />
          <Text style={{ color: '#666' }}>Cargando reportes…</Text>
        </View>
      );
    }
    if (errorLista) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 }}>
          <Ionicons name="cloud-offline-outline" size={48} color="#555" />
          <Text style={{ color: '#e57373', fontWeight: '600', textAlign: 'center' }}>{errorLista}</Text>
          <Pressable onPress={fetchLista}
                     style={{ backgroundColor: '#2d6a4f', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>Reintentar</Text>
          </Pressable>
        </View>
      );
    }
    if (!archivos.length) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="document-outline" size={48} color="#555" />
          <Text style={{ color: '#666', textAlign: 'center' }}>
            Aún no hay reportes.{'\n'}Genera uno con el chatbot.
          </Text>
        </View>
      );
    }
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 8 }}>
        <Text style={{ color: '#74c69d', fontSize: 13, marginBottom: 4 }}>
          {archivos.length} reporte{archivos.length !== 1 ? 's' : ''} disponible{archivos.length !== 1 ? 's' : ''}
        </Text>
        {archivos.map(a => {
          const esCampo = a.nombre.startsWith('reporte_campo');
          const fecha = new Date(a.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
          return (
            <Pressable key={a.nombre} onPress={() => fetchHojas(a.nombre)}
                       style={({ pressed, hovered }) => ({
                         flexDirection: 'row', alignItems: 'center', gap: 12,
                         backgroundColor: pressed ? '#2d6a4f' : hovered ? '#1e2a20' : '#1a1a1a',
                         borderWidth: 1, borderColor: '#2d3a2e',
                         borderRadius: 8, padding: 14,
                       })}>
              <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: esCampo ? '#1a472a' : '#1a2a47',
                             alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={esCampo ? 'leaf-outline' : 'analytics-outline'} size={18}
                          color={esCampo ? '#52b788' : '#60a5fa'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#e0e0e0', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
                  {a.nombre}
                </Text>
                <Text style={{ color: '#666', fontSize: 11, marginTop: 2 }}>{fecha}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#444" />
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  // ── Vista: visor de hojas ─────────────────────────────────────────────────
  const renderVisor = () => {
    const hojaNombres = hojas ? Object.keys(hojas) : [];
    const hojaData = hojas && hojaActiva ? hojas[hojaActiva] : null;

    return (
      <View style={{ flex: 1 }}>
        {/* Cabecera del archivo seleccionado */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10,
                       paddingHorizontal: 12, paddingVertical: 10,
                       backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#2d3a2e' }}>
          <Pressable onPress={() => { setArchivoSel(null); setHojas(null); }}
                     style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={20} color="#52b788" />
          </Pressable>
          <Ionicons name="document-text-outline" size={18} color="#74c69d" />
          <Text style={{ flex: 1, color: '#e0e0e0', fontSize: 13, fontWeight: '600' }} numberOfLines={1}>
            {archivoSel}
          </Text>
          <Pressable
            onPress={() => {
              const url = `${API_BASE}/outputs/${archivoSel}`;
              if (Platform.OS === 'web') { window.open(url, '_blank'); }
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4,
                     backgroundColor: '#1a472a', paddingHorizontal: 10, paddingVertical: 6,
                     borderRadius: 6 }}>
            <Ionicons name="cloud-download-outline" size={14} color="#52b788" />
            <Text style={{ color: '#52b788', fontSize: 12, fontWeight: '600' }}>Descargar</Text>
          </Pressable>
        </View>

        {loadingHojas && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color="#52b788" />
            <Text style={{ color: '#666' }}>Leyendo Excel…</Text>
          </View>
        )}

        {errorHojas && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32 }}>
            <Ionicons name="warning-outline" size={40} color="#e57373" />
            <Text style={{ color: '#e57373', textAlign: 'center' }}>{errorHojas}</Text>
          </View>
        )}

        {!loadingHojas && !errorHojas && hojas && (
          <>
            <SheetTabs names={hojaNombres} active={hojaActiva} onSelect={setHojaActiva} />
            {hojaData
              ? <SheetTable columnas={hojaData.columnas} filas={hojaData.filas} />
              : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#666' }}>Selecciona una hoja</Text>
                </View>
            }
          </>
        )}
      </View>
    );
  };

  // ── Layout principal ──────────────────────────────────────────────────────
  return (
    <Screen>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12,
                     borderBottomWidth: 1, borderBottomColor: '#e0e0e0',
                     paddingHorizontal: 20, paddingVertical: 14 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 2 }}>
          <Ionicons name="chevron-back" size={22} color="#9d6b99" />
        </Pressable>
        <Ionicons name="bar-chart-outline" size={22} color="#9d6b99" />
        <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: '#161616' }}>
          Reportes de Campo
        </Text>
        <Pressable onPress={fetchLista} style={{ padding: 4 }}>
          <Ionicons name="refresh-outline" size={20} color="#9d6b99" />
        </Pressable>
      </View>

      {/* Contenido */}
      <View style={{ flex: 1, backgroundColor: '#111' }}>
        {archivoSel ? renderVisor() : renderLista()}
      </View>
    </Screen>
  );
}
