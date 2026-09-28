import { useState } from 'react';
import { View, Text, Pressable, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MARK = require('../../../assets/buildwise-mark.png');
const WEB = Platform.OS === 'web';

// Paleta de la marca ("Malva y pizarra").
const C = {
  frame: '#2a2f45',
  screen: '#0c0e14',
  bar: '#151824',
  card: '#1b1f2e',
  line: 'rgba(255,255,255,0.08)',
  accent: '#9d6b99',
  accentDown: '#86597f',
  star: '#93a4c2',
  text: '#ffffff',
  muted: '#8d93a8',
  code: '#96ceb4',
};

// Iconos que representan al bot (su burbuja se resalta con el color de marca).
const BOT_ICONS = ['🤖', '✨'];

// Dentro del telefono solo se ve el logotipo de BuildWise: los emojis de los
// textos se quitan al pintar (si el motor no soporta \p{...}, se dejan tal cual).
const EMOJI = (() => {
  try {
    return new RegExp('[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}\\u{20E3}]', 'gu');
  } catch {
    return null;
  }
})();
const clean = (s) => (EMOJI && typeof s === 'string' ? s.replace(EMOJI, '').replace(/^[ \t]+/gm, '') : s);

// screens: [{ id, title, subtitle?, items?, actions: [{ label, to }] }]
export default function InteractiveMockup({ screens = [], initialScreen }) {
  const [current, setCurrent] = useState(initialScreen || screens[0]?.id);
  const screen = screens.find((s) => s.id === current) || screens[0];
  if (!screen) return null;

  return (
    <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
      <View
        style={{
          width: 220,
          height: 440,
          borderWidth: 2.5,
          borderColor: C.frame,
          borderRadius: 36,
          backgroundColor: C.screen,
          overflow: 'hidden',
          ...(WEB
            ? { boxShadow: '0 18px 50px rgba(157,107,153,0.28)' }
            : { shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }),
        }}
      >
        {/* Dynamic island */}
        <View style={{ width: 60, height: 14, marginTop: 10, alignSelf: 'center', backgroundColor: '#000', borderRadius: 20 }} />

        {/* Status bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 4 }}>
          <Text style={{ color: C.text, fontSize: 9, fontWeight: '700' }}>9:41</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="cellular" size={9} color={C.text} />
            <Ionicons name="battery-full" size={11} color={C.text} />
          </View>
        </View>

        {/* Header con la marca */}
        <View
          style={{
            backgroundColor: C.bar,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderBottomWidth: 1,
            borderBottomColor: C.line,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Image source={MARK} style={{ width: 22, height: 22 }} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontSize: 11, fontWeight: '700' }} numberOfLines={1}>
              {clean(screen.title)}
            </Text>
            {screen.subtitle && (
              <Text style={{ color: C.muted, fontSize: 8.5, marginTop: 1 }} numberOfLines={1}>
                {clean(screen.subtitle)}
              </Text>
            )}
          </View>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#78c8a0' }} />
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: 12, gap: 8 }}>
          {screen.items &&
            screen.items.map((item, i) => {
              const bot = BOT_ICONS.includes(item.icon);
              return (
                <View
                  key={i}
                  style={{
                    backgroundColor: bot ? 'rgba(157,107,153,0.18)' : C.card,
                    borderRadius: 10,
                    padding: 9,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    borderWidth: 1,
                    borderColor: bot ? 'rgba(157,107,153,0.35)' : C.line,
                  }}
                >
                  {item.icon ? (
                    <Image source={MARK} style={{ width: 16, height: 16, opacity: bot ? 1 : 0.55 }} resizeMode="contain" />
                  ) : null}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontSize: 10, fontWeight: '600', lineHeight: 14 }}>{clean(item.label)}</Text>
                    {item.sub && <Text style={{ color: C.muted, fontSize: 8.5, marginTop: 2 }}>{clean(item.sub)}</Text>}
                  </View>
                </View>
              );
            })}
          {screen.code && (
            <View style={{ backgroundColor: C.bar, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: C.line }}>
              <Text style={{ color: C.code, fontSize: 8, fontFamily: 'monospace', lineHeight: 13 }}>{clean(screen.code)}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ padding: 12, gap: 6, borderTopWidth: 1, borderTopColor: C.line }}>
          {screen.actions &&
            screen.actions.map((action) => (
              <Pressable
                key={action.to}
                onPress={() => setCurrent(action.to)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? C.accentDown : C.accent,
                  borderRadius: 999,
                  paddingVertical: 8,
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: '700' }}>{clean(action.label)}</Text>
              </Pressable>
            ))}
          {screen.back && (
            <Pressable
              onPress={() => setCurrent(screen.back)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? C.card : 'transparent',
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 999,
                paddingVertical: 7,
                alignItems: 'center',
              })}
            >
              <Text style={{ color: C.muted, fontSize: 10 }}>← Volver</Text>
            </Pressable>
          )}
          {!screen.actions?.length && !screen.back ? (
            <Text style={{ color: 'rgba(200,206,222,0.35)', fontSize: 8, textAlign: 'center', letterSpacing: 2 }}>
              BUILDWISE LABS
            </Text>
          ) : null}
        </View>

        {/* Home indicator */}
        <View style={{ alignItems: 'center', paddingBottom: 8 }}>
          <View style={{ width: 48, height: 4, backgroundColor: C.frame, borderRadius: 4 }} />
        </View>
      </View>

      {/* Indicadores de pantalla */}
      {screens.length > 1 && (
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 10, justifyContent: 'center', width: 220 }}>
          {screens.map((s) => (
            <Pressable key={s.id} onPress={() => setCurrent(s.id)}>
              <View
                style={{
                  width: current === s.id ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: current === s.id ? C.accent : C.frame,
                }}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
