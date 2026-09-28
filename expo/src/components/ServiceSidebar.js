import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { SERVICES } from '../constants/services';
import { api } from '../services/api';

const DEFAULT_SECTIONS = ['Que hacemos', 'Que incluye', 'Otros servicios'];
const ACCENT = '#9d6b99';

// Arbol del sidebar desde la API (Postgres). Se pide una sola vez por sesion.
let treeCache = null;
let treePromise = null;
function useDocsTree() {
  const [tree, setTree] = useState(treeCache);
  useEffect(() => {
    if (treeCache) return undefined;
    let alive = true;
    treePromise ||= api
      .serviceDocsTree()
      .then((r) => {
        treeCache = Object.fromEntries(r.services.map((s) => [s.id, s.groups]));
        return treeCache;
      })
      .catch(() => {
        treePromise = null; // sin base: se usa el contenido fijo y se reintenta luego
        return null;
      });
    treePromise.then((t) => alive && t && setTree(t));
    return () => {
      alive = false;
    };
  }, []);
  return tree;
}

// Grupos del contenido fijo (constants/services.js) con el mismo formato.
const staticGroups = (s) =>
  Array.isArray(s.sidebar)
    ? s.sidebar.map((g) => ({ slug: null, title: g.group, icon: g.icon, items: g.items.map((t) => ({ slug: null, title: t })) }))
    : null;

// ── Fila de item hoja ────────────────────────────────────────────────────────
function LeafItem({ label, active, onPress, c }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole={onPress ? 'link' : undefined}
      accessibilityState={{ selected: active }}
      style={{
        marginLeft: 24,
        borderLeftWidth: active ? 2 : 1,
        borderLeftColor: active ? ACCENT : c.line,
        paddingVertical: 7,
        paddingLeft: active ? 15 : 16,
        paddingRight: 8,
        backgroundColor: active ? c.activeBg : hovered && onPress ? c.hover : 'transparent',
      }}
    >
      <Text style={{ fontSize: 12, color: active ? c.activeText : c.muted, fontWeight: active ? '600' : '400' }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Grupo expandible ─────────────────────────────────────────────────────────
function SidebarGroup({ group, defaultOpen, activeDoc, onSelect, c }) {
  const hasActive = group.items.some((i) => i.slug && i.slug === activeDoc);
  const [open, setOpen] = useState(defaultOpen || hasActive);
  useEffect(() => {
    if (hasActive) setOpen(true);
  }, [hasActive]);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}
      >
        <Ionicons name={group.icon} size={14} color={ACCENT} />
        <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: c.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {group.title}
        </Text>
        <Text style={{ fontSize: 10, color: c.muted }}>{group.items.length}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={13} color="#8d8d8d" />
      </Pressable>
      {open && (
        <View style={{ paddingBottom: 4 }}>
          {group.items.map((item) => (
            <LeafItem
              key={item.slug || item.title}
              label={item.title}
              active={!!item.slug && item.slug === activeDoc}
              onPress={item.slug ? () => onSelect(item.slug) : undefined}
              c={c}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Sidebar principal ────────────────────────────────────────────────────────
/**
 * Sidebar de servicios. Cada servicio muestra sus grupos (Documentacion,
 * Tools, Soporte, Comunidad, Orientaciones, Educacion, Compatibilidad...)
 * desde la API (Postgres); si la base no esta disponible, usa el contenido
 * fijo de constants/services.js. Al elegir una pagina abre el panel de
 * documentacion en el servicio (parametro `doc` de la ruta).
 */
export default function ServiceSidebar({ currentId, activeDoc, navigation }) {
  const [expanded, setExpanded] = useState(currentId);
  const tree = useDocsTree();
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const c = dark
    ? { bg: '#161616', line: '#393939', text: '#f4f4f4', muted: '#a8a8a8', hover: '#262626', activeBg: 'rgba(157,107,153,0.18)', activeText: '#e0c3de', rowActive: 'rgba(157,107,153,0.14)' }
    : { bg: '#ffffff', line: '#e0e0e0', text: '#161616', muted: '#525252', hover: '#f4f4f4', activeBg: 'rgba(157,107,153,0.1)', activeText: '#7a4f76', rowActive: 'rgba(157,107,153,0.08)' };

  return (
    <View style={{ width: 272, alignSelf: 'flex-start', borderWidth: 1, borderColor: c.line, backgroundColor: c.bg }}>
      {/* Encabezado */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: c.line,
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: c.muted }}>
          Servicios
        </Text>
        {tree ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="server-outline" size={11} color={ACCENT} />
            <Text style={{ fontSize: 10, color: c.muted }}>docs en vivo</Text>
          </View>
        ) : null}
      </View>

      {SERVICES.map((s) => {
        const active = s.id === currentId;
        const isOpen = expanded === s.id;
        const groups = tree?.[s.id] || staticGroups(s);
        const select = (slug) =>
          navigation.navigate('Servicio', { id: s.id, doc: slug });

        return (
          <View key={s.id}>
            {/* Fila del servicio */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'stretch',
                borderLeftWidth: 4,
                borderLeftColor: active ? ACCENT : 'transparent',
                backgroundColor: active ? c.rowActive : 'transparent',
              }}
            >
              <Pressable
                style={{ flex: 1, paddingVertical: 10, paddingLeft: 10, paddingRight: 4 }}
                onPress={() => navigation.navigate('Servicio', { id: s.id })}
              >
                <Text style={{ fontSize: 13, fontWeight: active ? '600' : '400', color: active ? c.activeText : c.text }}>
                  {s.title}
                </Text>
              </Pressable>
              <Pressable
                style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}
                onPress={() => setExpanded(isOpen ? null : s.id)}
                accessibilityLabel={isOpen ? `Contraer ${s.title}` : `Expandir ${s.title}`}
              >
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={15} color="#8d8d8d" />
              </Pressable>
            </View>

            {/* Contenido expandido */}
            {isOpen && (
              <View style={{ borderTopWidth: 1, borderTopColor: c.hover }}>
                {groups ? (
                  groups.map((grp, idx) => (
                    <SidebarGroup
                      key={grp.slug || grp.title}
                      group={grp}
                      defaultOpen={idx === 0}
                      activeDoc={active ? activeDoc : null}
                      onSelect={select}
                      c={c}
                    />
                  ))
                ) : (
                  /* Fallback: secciones genericas */
                  <View style={{ paddingBottom: 4 }}>
                    {DEFAULT_SECTIONS.map((sec) => (
                      <LeafItem key={sec} label={sec} c={c} onPress={() => navigation.navigate('Servicio', { id: s.id })} />
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
