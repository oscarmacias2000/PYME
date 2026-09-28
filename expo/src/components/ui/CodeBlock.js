import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACCENT = '#9d6b99';
// Duracion aproximada de la reproduccion a 1x, sin importar el largo del codigo.
const PLAY_MS = 7000;
const TICK_MS = 30;

/**
 * Bloque de codigo con boton de copiar.
 * @param {boolean} playable   muestra controles para "reproducir" el codigo
 *                             escribiendose como un video (play/pausa, reinicio,
 *                             velocidad y barra de progreso con salto).
 * @param {number}  maxHeight  alto maximo del area de codigo (scroll interno).
 */
export default function CodeBlock({ code, lang, playable = false, maxHeight = 320 }) {
  const [copied, setCopied] = useState(false);
  // pos = caracteres visibles; null = codigo completo (estado de reposo).
  const [pos, setPos] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [barWidth, setBarWidth] = useState(0);
  const scrollRef = useRef(null);
  const len = code.length;

  // Si cambia el codigo (otro paso), vuelve al estado de reposo.
  useEffect(() => {
    setPos(null);
    setPlaying(false);
  }, [code]);

  useEffect(() => {
    if (!playing) return undefined;
    const step = Math.max(1, Math.ceil((len / (PLAY_MS / TICK_MS)) * speed));
    const id = setInterval(() => {
      setPos((p) => Math.min(len, (p ?? 0) + step));
      scrollRef.current?.scrollToEnd?.({ animated: false });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, speed, len]);

  useEffect(() => {
    if (pos !== null && pos >= len) setPlaying(false);
  }, [pos, len]);

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (pos === null || pos >= len) setPos(0);
    setPlaying(true);
  };

  const restart = () => {
    setPos(0);
    setPlaying(true);
  };

  const seek = (e) => {
    if (!barWidth) return;
    const ratio = Math.min(1, Math.max(0, e.nativeEvent.locationX / barWidth));
    setPos(Math.round(ratio * len));
  };

  const shown = pos === null ? code : code.slice(0, pos);
  const progress = pos === null ? 1 : pos / len;
  const typing = pos !== null && pos < len;

  return (
    <View style={{ borderWidth: 1, borderColor: '#393939', overflow: 'hidden' }}>
      {/* Barra superior */}
      <View style={{ backgroundColor: '#262626', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, gap: 12 }}>
        <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#8d8d8d', textTransform: 'uppercase', letterSpacing: 1 }}>
          {lang || 'code'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {playable && (
            <>
              <Pressable
                onPress={togglePlay}
                accessibilityLabel={playing ? 'Pausar reproduccion' : 'Reproducir codigo'}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name={playing ? 'pause' : 'play'} size={13} color={ACCENT} />
                <Text style={{ fontSize: 12, color: '#c498c2' }}>{playing ? 'Pausa' : 'Reproducir'}</Text>
              </Pressable>
              {pos !== null && (
                <Pressable onPress={restart} accessibilityLabel="Reiniciar reproduccion">
                  <Ionicons name="refresh" size={14} color="#8d8d8d" />
                </Pressable>
              )}
              <Pressable onPress={() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1))} accessibilityLabel="Cambiar velocidad">
                <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#8d8d8d' }}>{speed}x</Text>
              </Pressable>
            </>
          )}
          <Pressable onPress={copy} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons
              name={copied ? 'checkmark-outline' : 'copy-outline'}
              size={14}
              color={copied ? '#24a148' : '#8d8d8d'}
            />
            <Text style={{ fontSize: 12, color: copied ? '#24a148' : '#8d8d8d' }}>
              {copied ? 'Copiado' : 'Copiar'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Codigo */}
      <ScrollView
        ref={scrollRef}
        style={{ maxHeight, backgroundColor: '#161616' }}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            <Text
              selectable
              style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 22, color: '#e0e0e0' }}
            >
              {shown}
              {typing && <Text style={{ color: ACCENT }}>▍</Text>}
            </Text>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Barra de progreso (clic para saltar) */}
      {playable && (
        <Pressable
          onPress={seek}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          accessibilityLabel="Barra de progreso de la reproduccion"
          style={{ height: 10, justifyContent: 'center', backgroundColor: '#161616' }}
        >
          <View style={{ height: 3, backgroundColor: '#262626' }}>
            <View style={{ height: 3, width: `${progress * 100}%`, backgroundColor: ACCENT }} />
          </View>
        </Pressable>
      )}
    </View>
  );
}
