import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

import Starfield from './ui/Starfield';

const MARK = require('../../assets/buildwise-mark.png');
const WEB = Platform.OS === 'web';

// Tono del resplandor por escena (paleta de la marca), para distinguir las
// imagenes sin agregar iconos: solo el logotipo sobre el fondo espacial.
const GLOW = {
  chatbot: '#9d6b99',
  automatizacion: '#7088b3',
  apps: '#b58ab1',
  redes: '#8a7fb8',
  'visor-reportes': '#6f9a8f',
  consultoria: '#93a4c2',
};

/**
 * Imagen de marca de los servicios (tarjetas del Home y de Servicios, hero y
 * galeria del detalle): el simbolo de BuildWise Labs sobre el fondo espacial,
 * con un resplandor que late suavemente. Sin iconos ni fotos externas.
 * `scene` elige el tono del resplandor (galeria "En accion").
 */
export default function ServiceArt({ service, scene, height = 150, seed = 1, label }) {
  const id = scene || service.id;
  const glow = GLOW[id] || GLOW.chatbot;
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(t, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    );
    const start = setTimeout(() => loop.start(), (seed % 4) * 400);
    return () => {
      clearTimeout(start);
      loop.stop();
    };
  }, [t, seed]);

  const mark = Math.round(height * 0.42);

  return (
    <View
      className="w-full overflow-hidden bg-carbon-night"
      style={{ height }}
      accessibilityRole="image"
      accessibilityLabel={`${label || service.title} · BuildWise Labs`}
    >
      <Starfield count={28} seed={seed * 7 + 3} glow={false} />
      <View className="absolute inset-0 items-center justify-center">
        {/* Resplandor */}
        <Animated.View
          style={{
            position: 'absolute',
            width: mark * 2.4,
            height: mark * 2.4,
            borderRadius: mark * 1.2,
            backgroundColor: glow,
            opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.5] }),
            transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.05] }) }],
            ...(WEB ? { filter: `blur(${Math.round(mark * 0.45)}px)` } : {}),
          }}
        />
        {/* Logotipo */}
        <Animated.Image
          source={MARK}
          resizeMode="contain"
          style={{
            width: mark,
            height: mark,
            transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
          }}
        />
      </View>
    </View>
  );
}
