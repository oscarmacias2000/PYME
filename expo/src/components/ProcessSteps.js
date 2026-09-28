import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Starfield from './ui/Starfield';
import Button from './ui/Button';
import { PROCESS_STEPS } from '../constants/home';

const ACCENT = '#9d6b99';
const STAR = '#93a4c2';

/**
 * "Como trabajamos": 4 pasos clicables (tiles Carbon), barra de progreso
 * animada y panel con el detalle del paso activo. Diseno base: Stitch.
 */
export default function ProcessSteps() {
  const [active, setActive] = useState(1);
  const total = PROCESS_STEPS.length;
  const step = PROCESS_STEPS[active];

  // Progreso 0..1 animado: la barra llega hasta el marcador del paso activo.
  const progress = useRef(new Animated.Value(active / (total - 1))).current;
  // Fundido del panel de detalle al cambiar de paso.
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active / (total - 1),
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View className="mb-16 overflow-hidden rounded-3xl bg-carbon-night">
      <Starfield count={60} seed={11} glow={false} />
      <View className="px-5 pb-10 pt-12 md:px-10">
        {/* Encabezado */}
        <View className="mb-10">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-[2px] w-8 bg-carbon-blue" />
            <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
              Proceso
            </Text>
          </View>
          <Text className="font-plexlight text-3xl leading-10 text-white md:text-4xl md:leading-[48px]">
            De la idea al resultado en cuatro pasos
          </Text>
          <Text className="mt-2 max-w-2xl font-plex text-base leading-7 text-carbon-gray50">
            Metodología ágil pensada para PyMEs: entregables claros y validación contigo en cada
            etapa.
          </Text>
        </View>

        {/* Tiles de pasos */}
        <View className="flex-row flex-wrap gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
          {PROCESS_STEPS.map((s, i) => {
            const on = i === active;
            return (
              <Pressable
                key={s.id}
                onPress={() => setActive(i)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                className={`min-h-[160px] min-w-[200px] flex-1 basis-[22%] justify-between border-t-2 p-6 ${
                  on
                    ? 'border-carbon-blue bg-carbon-nightcard'
                    : 'border-transparent bg-[#11141e] hover:bg-carbon-nightcard'
                }`}
              >
                <View className="mb-4 flex-row items-start justify-between">
                  <Text
                    className={`font-plexbold text-2xl ${on ? 'text-carbon-blue' : 'text-carbon-gray70'}`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View
                    className={`rounded-lg p-2 ${on ? 'bg-carbon-blue/15' : 'bg-white/5'}`}
                  >
                    <Ionicons name={s.icon} size={20} color={on ? ACCENT : '#8d8d8d'} />
                  </View>
                </View>
                <View>
                  <View className="flex-row items-center gap-2">
                    <Text
                      className={`text-lg text-white ${on ? 'font-plexsemibold' : 'font-plex'}`}
                    >
                      {s.title}
                    </Text>
                    {on ? (
                      <View className="rounded-sm bg-carbon-blue/20 px-1.5 py-0.5">
                        <Text className="font-plexbold text-[10px] uppercase tracking-wider text-carbon-blue">
                          Activo
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <View
                      className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-carbon-star' : 'bg-carbon-gray70'}`}
                    />
                    <Text
                      className={`font-plex text-xs ${on ? 'text-carbon-star' : 'text-carbon-gray50'}`}
                    >
                      {s.duration}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Barra de progreso */}
        <View className="my-7 px-1.5">
          <View className="h-[3px] w-full rounded-full bg-white/10">
            <Animated.View
              style={{
                width,
                height: '100%',
                borderRadius: 999,
                backgroundColor: ACCENT,
                // Gradiente malva -> azul pizarra (solo web).
                backgroundImage: 'linear-gradient(90deg, #9d6b99, #7088b3)',
              }}
            />
          </View>
          <View className="absolute inset-x-0 -top-[3px] flex-row justify-between">
            {PROCESS_STEPS.map((s, i) => (
              <Pressable
                key={s.id}
                onPress={() => setActive(i)}
                accessibilityLabel={`Ir al paso ${i + 1}`}
                className={`h-3 w-3 rounded-full border-4 border-carbon-night ${
                  i < active ? 'bg-carbon-blue' : i === active ? 'bg-carbon-electric' : 'bg-carbon-gray90'
                }`}
                style={{ boxSizing: 'content-box' }}
              />
            ))}
          </View>
        </View>

        {/* Panel de detalle */}
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }}
          className="rounded-3xl border border-white/10 bg-carbon-nightcard p-8 md:p-10"
        >
          <View className="flex-row flex-wrap items-center justify-between gap-8">
            <View className="min-w-[260px] max-w-2xl flex-1">
              <View className="mb-2 flex-row flex-wrap items-center gap-3">
                <Text className="font-plexsemibold text-sm uppercase tracking-wider text-carbon-blue">
                  Paso {String(active + 1).padStart(2, '0')} de {String(total).padStart(2, '0')}
                </Text>
                <Text className="text-carbon-gray70">•</Text>
                <Text className="font-plex text-xs text-carbon-gray50">
                  Duración estimada: {step.duration}
                </Text>
              </View>
              <Text className="mb-3 font-plexlight text-3xl text-white">{step.title}</Text>
              <Text className="mb-6 font-plexlight text-base leading-7 text-carbon-gray20">
                {step.description}
              </Text>
              <Text className="mb-3 font-plexsemibold text-xs uppercase tracking-wider text-carbon-gray50">
                Entregables clave
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {step.deliverables.map((d) => (
                  <View
                    key={d}
                    className="min-w-[180px] flex-1 flex-row items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                  >
                    <View className="h-5 w-5 items-center justify-center rounded-full bg-carbon-star/10">
                      <Ionicons name="checkmark" size={14} color={STAR} />
                    </View>
                    <Text className="font-plex text-sm text-carbon-gray20">{d}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3 md:flex-col">
              <Button
                label="Anterior"
                variant="pillDark"
                icon="arrow-back"
                className={active === 0 ? 'opacity-40' : ''}
                onPress={() => setActive((a) => Math.max(0, a - 1))}
              />
              <Button
                label={active === total - 1 ? 'Volver al inicio' : 'Siguiente paso'}
                variant="pill"
                onPress={() => setActive((a) => (a + 1) % total)}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
