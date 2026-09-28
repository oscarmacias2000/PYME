import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';

import Starfield from './ui/Starfield';
import Button from './ui/Button';
import { FAQS } from '../constants/home';

/**
 * "Preguntas frecuentes": texto + CTA a la izquierda y acordeon animado a la
 * derecha (altura y rotacion del icono). Diseno base: Stitch.
 */
export default function FaqSection({ navigation }) {
  const [open, setOpen] = useState(0);

  return (
    <View className="mb-16 overflow-hidden rounded-3xl bg-carbon-night">
      <Starfield count={50} seed={29} glow={false} />
      <View className="flex-row flex-wrap gap-12 px-5 pb-10 pt-12 md:px-10">
        {/* Columna izquierda */}
        <View className="min-w-[260px] flex-[5]">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-[2px] w-8 bg-carbon-blue" />
            <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
              FAQ
            </Text>
          </View>
          <Text className="mb-4 font-plexlight text-3xl leading-10 text-white md:text-4xl md:leading-[48px]">
            Preguntas frecuentes
          </Text>
          <Text className="mb-8 font-plex text-base leading-7 text-carbon-gray50">
            Lo que necesitas saber sobre nuestros servicios de software a medida y automatización con
            IA para PyMEs.
          </Text>
          <View className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <Text className="mb-4 font-plex text-sm text-carbon-gray20">
              ¿Tienes un reto particular o una integración específica?
            </Text>
            <Button
              label="Contactar"
              variant="pill"
              className="self-start"
              onPress={() => navigation.navigate('Contacto')}
            />
          </View>
        </View>

        {/* Acordeon */}
        <View className="min-w-[280px] flex-[7] border-y border-carbon-gray90">
          {FAQS.map((f, i) => (
            <FaqItem
              key={f.q}
              item={f}
              first={i === 0}
              open={open === i}
              onToggle={() => setOpen((o) => (o === i ? -1 : i))}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function FaqItem({ item, open, first, onToggle }) {
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [open]);

  const height = anim.interpolate({ inputRange: [0, 1], outputRange: [0, contentH] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View className={`py-6 ${first ? '' : 'border-t border-carbon-gray90'}`}>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between gap-4"
      >
        <Text className="flex-1 font-plexsemibold text-lg text-white">{item.q}</Text>
        <Animated.View
          style={{ transform: [{ rotate }] }}
          className={`h-8 w-8 items-center justify-center rounded-full border ${
            open ? 'border-carbon-blue bg-carbon-blue/10' : 'border-white/20'
          }`}
        >
          <Text
            className={`font-plex text-lg leading-5 ${open ? 'text-carbon-blue' : 'text-carbon-gray20'}`}
          >
            +
          </Text>
        </Animated.View>
      </Pressable>

      <Animated.View style={{ height, opacity: anim, overflow: 'hidden' }}>
        {/* Se mide la altura natural de la respuesta para animar hasta ella. */}
        <View
          className="absolute left-0 right-0 top-0"
          onLayout={(e) => setContentH(e.nativeEvent.layout.height)}
        >
          <Text className="pt-4 font-plexlight text-base leading-7 text-carbon-gray20">
            {item.a}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
