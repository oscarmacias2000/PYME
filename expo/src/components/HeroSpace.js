import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from './ui/Button';
import Starfield from './ui/Starfield';
// Fondo del hero. Alternativa: AutomationCanvas ("del caos al orden").
import BrainGlobeCanvas from './ui/BrainGlobeCanvas';
import { CASES } from '../constants/services';

const NAV_H = 59; // franja de marca (3) + barra (56)

/**
 * Hero "planeta-cerebro": escena fija a pantalla completa mientras se hace scroll.
 * Con el scroll el planeta Tierra-cerebro se rompe en 3D (como en Astra) y
 * "BuildWise" y "Labs" viajan desde los extremos hasta formar el logotipo.
 */
export default function HeroSpace({ scrollY, navigation }) {
  const { width, height } = useWindowDimensions();
  const stageH = Math.max(height - NAV_H, 560);
  const SCROLL = Math.round(stageH * 1.1); // recorrido con la escena fija
  const small = width < 640;
  const pad = small ? 14 : 48;
  const wordSize = small ? 27 : width < 1024 ? 68 : 92;
  const finalScale = small ? 1 : 0.55;

  // Avance del scroll para el canvas (0..1) y palabra senalada.
  const progressRef = useRef(0);
  const hoverRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const p = Math.min(Math.max(value / SCROLL, 0), 1);
      progressRef.current = p;
      setDone(p > 0.72);
    });
    return () => scrollY.removeListener(id);
  }, [scrollY, SCROLL]);

  const setHoverBoth = (v) => {
    hoverRef.current = v;
    setHover(v);
  };

  // Paralaje opuesto de las palabras con el puntero (solo web).
  const mouse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const onMove = (e) => mouse.setValue((e.clientX / window.innerWidth) * 2 - 1);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouse]);

  // Anchos medidos de cada palabra para calcular donde se encuentran.
  const [wl, setWl] = useState(0);
  const [wr, setWr] = useState(0);
  const gap = small ? 8 : 14;
  const leftFinal = width / 2 - gap - (wl * finalScale) / 2 - pad - wl / 2;
  const rightFinal = width / 2 + gap + (wr * finalScale) / 2 - (width - pad - wr / 2);

  const clamp = { extrapolate: 'clamp' };
  const R = (a, b) => [SCROLL * a, SCROLL * b];

  const pin = scrollY.interpolate({ inputRange: [0, SCROLL], outputRange: [0, SCROLL], ...clamp });
  const converge = (to) =>
    scrollY.interpolate({ inputRange: R(0, 0.7), outputRange: [0, to], ...clamp });
  const parallax = scrollY.interpolate({ inputRange: R(0, 0.5), outputRange: [16, 0], ...clamp });
  const leftX = Animated.add(converge(leftFinal), Animated.multiply(mouse, parallax));
  const rightX = Animated.add(
    converge(rightFinal),
    Animated.multiply(mouse, Animated.multiply(parallax, -1))
  );
  const wordScale = scrollY.interpolate({ inputRange: R(0, 0.7), outputRange: [1, finalScale], ...clamp });

  const introOpacity = scrollY.interpolate({ inputRange: R(0, 0.3), outputRange: [1, 0], ...clamp });
  const outroOpacity = scrollY.interpolate({ inputRange: R(0.7, 0.95), outputRange: [0, 1], ...clamp });
  const outroY = scrollY.interpolate({ inputRange: R(0.7, 0.95), outputRange: [24, 0], ...clamp });

  // Interaccion entre palabras: al senalar una, la otra responde.
  const leftColor = hover === 'right' ? '#93a4c2' : '#ffffff';
  const rightColor = hover === 'left' ? '#c49bc0' : '#ffffff';
  return (
    <View className="w-full bg-carbon-night">
      <View style={{ height: stageH + SCROLL }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: stageH,
            overflow: 'hidden',
            transform: [{ translateY: pin }],
          }}
        >
          <BrainGlobeCanvas progressRef={progressRef} hoverRef={hoverRef} />

          {/* BuildWise ... Labs */}
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: pad,
            }}
          >
            <Word
              x={leftX}
              y={0}
              scale={wordScale}
              color={leftColor}
              font="IBMPlexSans_600SemiBold"
              size={wordSize}
              onLayout={(e) => setWl(e.nativeEvent.layout.width)}
              onHover={(on) => setHoverBoth(on ? 'left' : null)}
              onPress={() => setHoverBoth(hover === 'left' ? null : 'left')}
            >
              BuildWise
            </Word>
            <Word
              x={rightX}
              y={0}
              scale={wordScale}
              color={rightColor}
              font="IBMPlexSans_300Light"
              size={wordSize}
              onLayout={(e) => setWr(e.nativeEvent.layout.width)}
              onHover={(on) => setHoverBoth(on ? 'right' : null)}
              onPress={() => setHoverBoth(hover === 'right' ? null : 'right')}
            >
              Labs
            </Word>
          </View>

          {/* Intro: frase como en el video + indicacion de scroll */}
          <Animated.View
            pointerEvents="none"
            style={{ position: 'absolute', left: 0, right: 0, bottom: small ? 40 : 56, alignItems: 'center', opacity: introOpacity }}
          >
            <Text className="px-6 text-center font-plex text-2xl text-white md:text-3xl">
              Una nueva generación de sistemas inteligentes
            </Text>
            <View className="mt-5 flex-row items-center gap-2">
              <Text className="font-plex text-xs uppercase tracking-[2px] text-carbon-gray50">
                Desliza para explorar
              </Text>
              <Ionicons name="chevron-down" size={14} color="#8d8d8d" />
            </View>
          </Animated.View>

          {/* Outro: mensaje y acciones una vez formado el logotipo */}
          <Animated.View
            pointerEvents={done ? 'box-none' : 'none'}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: small ? 36 : 64,
              alignItems: 'center',
              opacity: outroOpacity,
              transform: [{ translateY: outroY }],
            }}
          >
            <View className="flex-row items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-carbon-star" />
              <Text className="font-plex text-xs tracking-[1px] text-carbon-gray20">
                IA · Automatización · Ciberseguridad
              </Text>
            </View>
            <Text className="mt-5 max-w-2xl px-6 text-center font-plexlight text-base leading-7 text-carbon-gray20 md:text-lg">
              Automatizamos tu operación con IA y tecnología para que tu negocio
              haga más con menos trabajo manual.
            </Text>
            <View className="mt-7 flex-row flex-wrap justify-center gap-3 px-6">
              <Button
                label="Explora los servicios"
                variant="pill"
                onPress={() => navigation.navigate('Servicios')}
              />
              <Button
                label="Hablemos"
                variant="pillDark"
                icon={null}
                onPress={() => navigation.navigate('Contacto')}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Metricas de impacto */}
      <View className="relative overflow-hidden">
        <Starfield count={50} seed={5} glow={false} />
        <View className="mx-auto w-full max-w-4xl flex-row flex-wrap justify-center gap-3 px-6 pb-16 pt-4">
          {CASES.slice(0, 3).map((c) => (
            <View
              key={c.id}
              className="min-w-[180px] flex-1 items-center rounded-2xl border border-white/10 bg-carbon-nightcard px-5 py-6"
            >
              <Text className="font-plexlight text-4xl text-white">{c.metric}</Text>
              <Text className="mt-2 max-w-[200px] text-center font-plex text-xs leading-5 text-carbon-gray50">
                {c.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Palabra del logotipo; al senalarla, la otra palabra responde. */
function Word({ x, y, scale, color, font, size, onLayout, onHover, onPress, children }) {
  const glow =
    color === '#ffffff'
      ? {}
      : { textShadowColor: color, textShadowRadius: 24, textShadowOffset: { width: 0, height: 0 } };
  return (
    <Animated.View
      onLayout={onLayout}
      style={{ transform: [{ translateX: x }, { translateY: y }, { scale }] }}
    >
      <Pressable
        onHoverIn={() => onHover(true)}
        onHoverOut={() => onHover(false)}
        onPress={onPress}
      >
        <Text style={{ color, fontFamily: font, fontSize: size, letterSpacing: -1, ...glow }}>
          {children}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
