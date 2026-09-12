import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';

const COLORS = {
  router: '#0f62fe',
  switch: '#24a148',
  cloud:  '#8a3ffc',
  firewall: '#da1e28',
  pc:     '#f1c21b',
};

const ICONS = { router: '⬡', switch: '⬜', cloud: '☁', firewall: '🛡', pc: '💻' };

function toAbs(val, size) { return Math.round(val * size); }

// SVG string generator — rendered inline on web
function buildSvg(nodes, links, w, h, selected) {
  const defs = `<defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#8d8d8d"/>
    </marker>
  </defs>`;

  const linksSvg = links.map((l) => {
    const a = nodes.find((n) => n.id === l.from);
    const b = nodes.find((n) => n.id === l.to);
    if (!a || !b) return '';
    const x1 = toAbs(a.x, w), y1 = toAbs(a.y, h);
    const x2 = toAbs(b.x, w), y2 = toAbs(b.y, h);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const color = l.color || '#525252';
    return `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5" stroke-dasharray="${l.dashed ? '5,4' : 'none'}"/>
      ${l.subnet ? `<rect x="${mx - 38}" y="${my - 10}" width="76" height="14" rx="3" fill="#161616" opacity="0.85"/>
      <text x="${mx}" y="${my + 2}" text-anchor="middle" font-size="8" fill="#a8a8a8" font-family="monospace">${l.subnet}</text>` : ''}
      ${l.label ? `<text x="${mx}" y="${my - 13}" text-anchor="middle" font-size="8" fill="${color}" font-family="monospace" font-weight="600">${l.label}</text>` : ''}
    `;
  }).join('');

  const nodesSvg = nodes.map((n) => {
    const x = toAbs(n.x, w), y = toAbs(n.y, h);
    const color = n.color || COLORS[n.type] || '#0f62fe';
    const sel = selected === n.id;
    const r = n.type === 'switch' ? 18 : 20;
    const shape = n.type === 'switch'
      ? `<rect x="${x - r}" y="${y - r}" width="${r * 2}" height="${r * 2}" rx="4" fill="${color}" stroke="${sel ? '#ffffff' : 'transparent'}" stroke-width="2"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${sel ? '#ffffff' : 'transparent'}" stroke-width="2"/>`;
    return `
      ${shape}
      <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="#ffffff" font-family="monospace" font-weight="700">${n.label}</text>
      ${n.ip ? `<text x="${x}" y="${y + r + 12}" text-anchor="middle" font-size="8" fill="#a8a8a8" font-family="monospace">${n.ip}</text>` : ''}
    `;
  }).join('');

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="#161616" rx="0"/>
    ${defs}
    ${linksSvg}
    ${nodesSvg}
  </svg>`;
}

export default function NetworkTopology({ nodes = [], links = [], height = 260, detail }) {
  const [selected, setSelected] = useState(null);
  const W = 560, H = height;
  const node = nodes.find((n) => n.id === selected);

  if (Platform.OS !== 'web') {
    return (
      <View style={{ height, backgroundColor: '#161616', borderWidth: 1, borderColor: '#393939', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#525252', fontSize: 12, fontFamily: 'monospace' }}>Topología disponible en web</Text>
      </View>
    );
  }

  const svg = buildSvg(nodes, links, W, H, selected);

  return (
    <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#393939', overflow: 'hidden' }}>
      {/* Barra superior */}
      <View style={{ backgroundColor: '#262626', paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#24a148' }} />
        <Text style={{ color: '#8d8d8d', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, textTransform: 'uppercase' }}>
          Network Topology
        </Text>
        <View style={{ flex: 1 }} />
        {nodes.map((n) => (
          <Pressable key={n.id} onPress={() => setSelected(selected === n.id ? null : n.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2,
              backgroundColor: selected === n.id ? (n.color || COLORS[n.type]) : 'transparent',
              borderWidth: 1, borderColor: selected === n.id ? 'transparent' : '#393939', borderRadius: 3 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: n.color || COLORS[n.type] }} />
            <Text style={{ color: selected === n.id ? '#fff' : '#8d8d8d', fontSize: 9, fontFamily: 'monospace' }}>{n.id}</Text>
          </Pressable>
        ))}
      </View>

      {/* Diagrama SVG */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <div
          style={{ cursor: 'default' }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </ScrollView>

      {/* Panel de detalle del nodo seleccionado */}
      {node && (
        <View style={{ backgroundColor: '#1c1c1e', padding: 12, borderTopWidth: 1, borderTopColor: '#393939' }}>
          <Text style={{ color: node.color || COLORS[node.type], fontSize: 10, fontFamily: 'monospace', fontWeight: '700', marginBottom: 4 }}>
            {node.label} · {node.type?.toUpperCase()}
          </Text>
          {node.ip    && <Text style={{ color: '#a8a8a8', fontSize: 10, fontFamily: 'monospace' }}>IP: {node.ip}</Text>}
          {node.detail && node.detail.map((d, i) => (
            <Text key={i} style={{ color: '#a8a8a8', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>{d}</Text>
          ))}
        </View>
      )}

      {/* Leyenda del protocolo */}
      {detail && (
        <View style={{ backgroundColor: '#0d0d0d', padding: 12, borderTopWidth: 1, borderTopColor: '#393939' }}>
          <Text style={{ color: '#6f6f6f', fontSize: 10, fontFamily: 'monospace', lineHeight: 16 }}>{detail}</Text>
        </View>
      )}
    </View>
  );
}
