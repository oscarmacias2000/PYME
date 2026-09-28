import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import MarkdownView from './MarkdownView';
import BrandIcon, { hasBrandIcon } from './ui/BrandIcon';
import { api } from '../services/api';

// Colores de los estados en las tablas (Compatible, Beta, Abierto...).
const STATUS = {
  compatible: '#24a148',
  estable: '#24a148',
  resuelto: '#24a148',
  obligatorio: '#da1e28',
  alta: '#da1e28',
  parcial: '#d6a100',
  beta: '#d6a100',
  'en progreso': '#d6a100',
  media: '#d6a100',
  recomendado: '#8ca5d2',
  intermedio: '#8ca5d2',
  'en evaluacion': '#9d6b99',
  abierto: '#9d6b99',
  avanzado: '#9d6b99',
  basico: '#24a148',
  baja: '#8d8d8d',
  'no soportado': '#da1e28',
};
const statusColor = (v) =>
  STATUS[String(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || '#8d8d8d';

const KIND = {
  article: { icon: 'document-text-outline', label: 'Artículo' },
  steps: { icon: 'list-outline', label: 'Pasos' },
  table: { icon: 'grid-outline', label: 'Datos' },
  thread: { icon: 'chatbubbles-outline', label: 'Comunidad' },
  checklist: { icon: 'checkbox-outline', label: 'Checklist' },
};

/** Tabla de datos de la pagina (columnas + filas desde Postgres). */
function DataTable({ columns, rows }) {
  const [box, setBox] = useState(0);
  if (!columns?.length || !rows?.length) return null;
  // Reparte el ancho disponible; en pantallas angostas se desplaza de lado.
  // La primera columna (nombre/tema) recibe mas espacio que las demas.
  const unit = (box - 2) / (columns.length + 0.6);
  const colW = (i) => Math.max(i === 0 ? 180 : 110, Math.floor(unit * (i === 0 ? 1.6 : 1)));
  return (
    <View className="mt-6" onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="overflow-hidden rounded-xl border border-carbon-gray20 dark:border-carbon-gray90">
          <View className="flex-row bg-carbon-gray10 dark:bg-carbon-gray90">
            {columns.map((col, ci) => (
              <Text
                key={col.key}
                style={{ width: colW(ci) }}
                className="px-4 py-2.5 font-plexsemibold text-xs uppercase tracking-wider text-carbon-gray70 dark:text-carbon-gray20"
              >
                {col.label}
              </Text>
            ))}
          </View>
          {rows.map((row, i) => (
            <View key={i} className="flex-row border-t border-carbon-gray20 dark:border-carbon-gray90">
              {columns.map((col, ci) => {
                const v = row[col.key];
                return (
                  <View key={col.key} style={{ width: colW(ci) }} className="justify-center px-4 py-2.5">
                    {col.status ? (
                      <View
                        className="flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: `${statusColor(v)}1f` }}
                      >
                        <View
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: statusColor(v) }}
                        />
                        <Text className="font-plex text-xs" style={{ color: statusColor(v) }}>
                          {v}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center gap-2">
                        {/* Logotipo de sistema operativo o navegador (primera columna) */}
                        {ci === 0 && hasBrandIcon(v) ? <BrandIcon name={v} size={16} /> : null}
                        <Text className="flex-shrink font-plex text-sm text-carbon-black dark:text-white">{String(v ?? '')}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Pagina de documentacion de un servicio (grupo del sidebar), leida del
 * Postgres aislado via /api/service-docs/:serviceId/:slug.
 */
export default function ServiceDocPanel({ serviceId, slug, onClose }) {
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    api
      .serviceDoc(serviceId, slug)
      .then((r) => alive && setState({ item: r.item }))
      .catch((e) => alive && setState({ error: e.message }));
    return () => {
      alive = false;
    };
  }, [serviceId, slug]);

  const { item, loading, error } = state;
  const kind = KIND[item?.kind] || KIND.article;
  const date = item?.updated_at
    ? new Date(item.updated_at).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View
      className="mb-12 rounded-2xl border border-carbon-gray20 bg-white p-6 dark:border-carbon-gray90 dark:bg-carbon-black md:p-8"
      style={{ borderTopWidth: 3, borderTopColor: '#9d6b99' }}
    >
      {/* Barra superior: ruta + cerrar */}
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <View className="flex-1 flex-row flex-wrap items-center gap-1.5">
          {item ? (
            <>
              <Ionicons name={item.group_icon} size={14} color="#9d6b99" />
              <Text className="font-plexsemibold text-xs uppercase tracking-wider text-carbon-blue">
                {item.group_title}
              </Text>
              <Ionicons name="chevron-forward" size={12} color="#8d8d8d" />
              <Text className="font-plex text-xs text-carbon-gray50">{item.title}</Text>
            </>
          ) : null}
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar documentación"
          className="h-8 w-8 items-center justify-center rounded-full hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
        >
          <Ionicons name="close" size={18} color="#8d8d8d" />
        </Pressable>
      </View>

      {loading ? (
        <View className="items-center py-12">
          <ActivityIndicator color="#9d6b99" />
        </View>
      ) : error ? (
        <View className="items-center gap-2 py-10">
          <Ionicons name="server-outline" size={32} color="#8d8d8d" />
          <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">
            No se pudo cargar esta página
          </Text>
          <Text className="max-w-md text-center font-plex text-sm text-carbon-gray50">
            {error}. Verifica que el backend y la base de documentación estén encendidos.
          </Text>
        </View>
      ) : (
        <View>
          <Text className="font-plexlight text-3xl text-carbon-black dark:text-white">{item.title}</Text>
          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-carbon-gray10 px-3 py-1 dark:bg-carbon-gray90">
              <Ionicons name={kind.icon} size={12} color="#8d8d8d" />
              <Text className="font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">
                {kind.label}
              </Text>
            </View>
            <Text className="font-plex text-xs text-carbon-gray50">
              {item.author} · {date}
            </Text>
            <View className="rounded-full border border-dashed border-carbon-blue/50 px-2.5 py-0.5">
              <Text className="font-plex text-[11px] text-carbon-blue">Datos de ejemplo</Text>
            </View>
          </View>
          {item.summary ? (
            <Text className="mt-4 font-plex text-base leading-7 text-carbon-gray70 dark:text-carbon-gray20">
              {item.summary}
            </Text>
          ) : null}
          {item.body ? (
            <View className="mt-2">
              <MarkdownView content={item.body} />
            </View>
          ) : null}
          <DataTable columns={item.columns} rows={item.rows} />
        </View>
      )}
    </View>
  );
}
