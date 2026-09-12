import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SERVICES } from '../constants/services';

const DEFAULT_SECTIONS = ['Que hacemos', 'Que incluye', 'Otros servicios'];

// ── Fila de item hoja ────────────────────────────────────────────────────────
function LeafItem({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        marginLeft: 24,
        borderLeftWidth: 1,
        borderLeftColor: '#e0e0e0',
        paddingVertical: 7,
        paddingLeft: 16,
        paddingRight: 8,
        backgroundColor: hovered ? '#f4f4f4' : 'transparent',
      }}
    >
      <Text style={{ fontFamily: 'IBMPlexMono', fontSize: 12, color: '#525252' }}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Grupo expandible ─────────────────────────────────────────────────────────
function SidebarGroup({ group, icon, items, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <Ionicons name={icon} size={14} color="#0f62fe" />
        <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#161616', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {group}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={13}
          color="#8d8d8d"
        />
      </Pressable>
      {open && (
        <View style={{ paddingBottom: 4 }}>
          {items.map((item) => (
            <LeafItem key={item} label={item} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Sidebar principal ────────────────────────────────────────────────────────
export default function ServiceSidebar({ currentId, navigation }) {
  const [expanded, setExpanded] = useState(currentId);

  return (
    <View
      style={{
        width: 272,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Encabezado */}
      <Text
        style={{
          borderBottomWidth: 1,
          borderBottomColor: '#e0e0e0',
          paddingHorizontal: 16,
          paddingVertical: 10,
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: '#525252',
        }}
      >
        Servicios
      </Text>

      {SERVICES.map((s) => {
        const active = s.id === currentId;
        const isOpen = expanded === s.id;
        const hasDocs = Array.isArray(s.sidebar) && s.sidebar.length > 0;

        return (
          <View key={s.id}>
            {/* Fila del servicio */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'stretch',
                borderLeftWidth: 4,
                borderLeftColor: active ? '#0f62fe' : 'transparent',
                backgroundColor: active ? '#edf5ff' : 'transparent',
              }}
            >
              <Pressable
                style={{ flex: 1, paddingVertical: 10, paddingLeft: 10, paddingRight: 4 }}
                onPress={() => navigation.navigate('Servicio', { id: s.id })}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? '600' : '400',
                    color: active ? '#0f62fe' : '#161616',
                  }}
                >
                  {s.title}
                </Text>
              </Pressable>
              <Pressable
                style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}
                onPress={() => setExpanded(isOpen ? null : s.id)}
              >
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color="#8d8d8d"
                />
              </Pressable>
            </View>

            {/* Contenido expandido */}
            {isOpen && (
              <View style={{ borderTopWidth: 1, borderTopColor: '#f4f4f4' }}>
                {hasDocs ? (
                  /* Árbol de documentación por grupos */
                  s.sidebar.map((grp, idx) => (
                    <SidebarGroup
                      key={grp.group}
                      group={grp.group}
                      icon={grp.icon}
                      items={grp.items}
                      defaultOpen={idx === 0}
                    />
                  ))
                ) : (
                  /* Fallback: secciones genéricas */
                  <View style={{ paddingBottom: 4 }}>
                    {DEFAULT_SECTIONS.map((sec) => (
                      <Pressable
                        key={sec}
                        onPress={() => navigation.navigate('Servicio', { id: s.id })}
                        style={{
                          marginLeft: 24,
                          borderLeftWidth: 1,
                          borderLeftColor: '#e0e0e0',
                          paddingVertical: 8,
                          paddingLeft: 16,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: '#525252' }}>{sec}</Text>
                      </Pressable>
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
