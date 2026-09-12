import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

// screens: [{ id, title, subtitle?, items?, actions: [{ label, to }] }]
export default function InteractiveMockup({ screens = [], initialScreen }) {
  const [current, setCurrent] = useState(initialScreen || screens[0]?.id);
  const screen = screens.find((s) => s.id === current) || screens[0];
  if (!screen) return null;

  return (
    <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
      <View style={{
        width: 220, height: 440,
        borderWidth: 2.5, borderColor: '#262626',
        borderRadius: 36,
        backgroundColor: '#0d0d0d',
        overflow: 'hidden',
        shadowColor: '#0f62fe',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 12,
      }}>
        {/* Dynamic island */}
        <View style={{ width: 60, height: 14, marginTop: 10, alignSelf: 'center', backgroundColor: '#000', borderRadius: 20 }} />

        {/* Status bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 4 }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>9:41</Text>
          <Text style={{ color: '#fff', fontSize: 9 }}>▲ 🔋</Text>
        </View>

        {/* Header */}
        <View style={{ backgroundColor: '#161616', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#262626' }}>
          <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>{screen.title}</Text>
          {screen.subtitle && (
            <Text style={{ color: '#8d8d8d', fontSize: 9, textAlign: 'center', marginTop: 2 }}>{screen.subtitle}</Text>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: 14, gap: 8 }}>
          {screen.items && screen.items.map((item, i) => (
            <View key={i} style={{ backgroundColor: '#1c1c1e', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {item.icon && <Text style={{ fontSize: 14 }}>{item.icon}</Text>}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '600' }}>{item.label}</Text>
                {item.sub && <Text style={{ color: '#6b7280', fontSize: 9, marginTop: 1 }}>{item.sub}</Text>}
              </View>
            </View>
          ))}
          {screen.code && (
            <View style={{ backgroundColor: '#161616', borderRadius: 6, padding: 10 }}>
              <Text style={{ color: '#42be65', fontSize: 8, fontFamily: 'monospace', lineHeight: 13 }}>{screen.code}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ padding: 12, gap: 6, borderTopWidth: 1, borderTopColor: '#262626' }}>
          {screen.actions && screen.actions.map((action) => (
            <Pressable
              key={action.to}
              onPress={() => setCurrent(action.to)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#0043ce' : '#0f62fe',
                borderRadius: 6,
                paddingVertical: 8,
                alignItems: 'center',
              })}
            >
              <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>{action.label}</Text>
            </Pressable>
          ))}
          {screen.back && (
            <Pressable
              onPress={() => setCurrent(screen.back)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#1c1c1e' : 'transparent',
                borderWidth: 1, borderColor: '#393939',
                borderRadius: 6, paddingVertical: 7, alignItems: 'center',
              })}
            >
              <Text style={{ color: '#8d8d8d', fontSize: 10 }}>← Volver</Text>
            </Pressable>
          )}
        </View>

        {/* Home indicator */}
        <View style={{ alignItems: 'center', paddingBottom: 8 }}>
          <View style={{ width: 48, height: 4, backgroundColor: '#393939', borderRadius: 4 }} />
        </View>
      </View>

      {/* Indicadores de pantalla */}
      {screens.length > 1 && (
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 10, justifyContent: 'center', width: 220 }}>
          {screens.map((s) => (
            <Pressable key={s.id} onPress={() => setCurrent(s.id)}>
              <View style={{
                width: current === s.id ? 18 : 6,
                height: 6, borderRadius: 3,
                backgroundColor: current === s.id ? '#0f62fe' : '#393939',
              }} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
