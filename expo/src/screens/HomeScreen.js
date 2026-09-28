import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Starfield from '../components/ui/Starfield';
import CarbonTile from '../components/CarbonTile';
import HeroSpace from '../components/HeroSpace';
import ToolsGrid from '../components/ToolsGrid';
import LikeSection from '../components/LikeSection';
import ProcessSteps from '../components/ProcessSteps';
import FaqSection from '../components/FaqSection';
import { SERVICES, CARD_SERVICES, RECOMMENDED, PRODUCTS } from '../constants/services';

export default function HomeScreen({ navigation }) {
  const { colorScheme } = useColorScheme();
  const arrow = colorScheme === 'dark' ? '#f4f4f4' : '#161616';
  return (
    <Screen
      hero={(scrollY) => (
        <HeroSpace scrollY={scrollY} navigation={navigation} />
      )}
    >
      {/* RECOMENDADO */}
      <View className="pt-16" />
      <SectionTitle eyebrow="Novedades">Recomendado para ti</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {RECOMMENDED.map((r) => (
          <Pressable
            key={r.id}
            className="min-w-[220px] flex-1 bg-white dark:bg-carbon-black p-5 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
          >
            <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
              {r.tag}
            </Text>
            <Text className="mt-3 min-h-[72px] font-plex text-base leading-6 text-carbon-black dark:text-white">
              {r.title}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={arrow} />
          </Pressable>
        ))}
      </View>

      {/* SERVICIOS (tiles) */}
      <SectionTitle eyebrow="Lo que hacemos">Nuestros servicios</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {CARD_SERVICES.map((s, i) => (
          <View key={s.id} className="min-w-[260px] flex-1 basis-[45%]">
            <CarbonTile
              service={s}
              index={i}
              onPress={() => navigation.navigate('Servicio', { id: s.id })}
            />
          </View>
        ))}
      </View>

      {/* VITRINA DE SERVICIOS (estilo Astra) */}
      <ServiceShowcase navigation={navigation} />

      {/* COMO TRABAJAMOS (proceso paso a paso) */}
      <ProcessSteps />

      {/* PRODUCTOS */}
      <SectionTitle eyebrow="Productos">Tecnologia de vanguardia para tu negocio</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-3">
        {PRODUCTS.map((p) => (
          <View
            key={p}
            className="border border-carbon-gray20 dark:border-carbon-gray90 px-4 py-3 hover:border-carbon-blue"
          >
            <Text className="font-plex text-base text-carbon-black dark:text-white">{p}</Text>
          </View>
        ))}
      </View>

      {/* HERRAMIENTAS */}
      <ToolsGrid />

      {/* LIKES */}
      <LikeSection />

      {/* PREGUNTAS FRECUENTES */}
      <FaqSection navigation={navigation} />

      {/* CTA FINAL */}
      <View className="mb-16 overflow-hidden rounded-3xl border border-white/10 bg-carbon-night">
        <Starfield count={60} seed={21} />
        <View className="flex-row flex-wrap items-center justify-between gap-6 p-10 md:p-14">
          <View className="max-w-[480px]">
            <Text className="font-plex text-xs uppercase tracking-[2px] text-carbon-star">
              Hablemos
            </Text>
            <Text className="mt-3 font-plexlight text-3xl leading-10 text-white md:text-4xl md:leading-[48px]">
              Empecemos a construir la proxima etapa de tu empresa
            </Text>
          </View>
          <Button
            label="Contactar"
            variant="pill"
            onPress={() => navigation.navigate('Contacto')}
          />
        </View>
      </View>
    </Screen>
  );
}

// Etiquetas cortas para las pestanas de la vitrina.
const SHORT = {
  chatbot: 'Chatbot',
  automatizacion: 'Automatización',
  apps: 'Apps con IA',
  redes: 'Seguridad',
  'visor-reportes': 'Reportes',
  consultoria: 'Consultoría',
};

/** Selector tipo pildora + panel espacial con el servicio elegido. */
function ServiceShowcase({ navigation }) {
  const [active, setActive] = useState(SERVICES[0].id);
  const s = SERVICES.find((x) => x.id === active) || SERVICES[0];

  return (
    <View className="mb-16 overflow-hidden rounded-3xl bg-carbon-night">
      <Starfield count={70} seed={3} />
      <View className="items-center px-5 pb-10 pt-12 md:px-10">
        <Text className="text-center font-plexlight text-3xl text-white md:text-4xl">
          Una plataforma, seis capacidades
        </Text>

        {/* Pestanas pildora */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-8 max-w-full"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View className="flex-row gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {SERVICES.map((x) => {
              const on = x.id === active;
              return (
                <Pressable
                  key={x.id}
                  onPress={() => setActive(x.id)}
                  className={`rounded-full px-4 py-2 ${on ? 'bg-white/15' : 'hover:bg-white/5'}`}
                >
                  <Text
                    className={`font-plexsemibold text-[13px] ${
                      on ? 'text-white' : 'text-carbon-gray50'
                    }`}
                  >
                    {SHORT[x.id] || x.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Tarjeta del servicio activo */}
        <View className="mt-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-carbon-nightcard p-8">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Ionicons name={s.icon} size={20} color="#93a4c2" />
            </View>
            <Text className="font-plex text-xs uppercase tracking-[2px] text-carbon-star">
              {s.tagline}
            </Text>
          </View>
          <Text className="mt-5 font-plexsemibold text-2xl text-white">{s.title}</Text>
          <Text className="mt-3 font-plexlight text-base leading-7 text-carbon-gray20">
            {s.description}
          </Text>
          <Button
            label="Ver servicio"
            variant="pill"
            className="mt-8 self-start"
            onPress={() => navigation.navigate('Servicio', { id: s.id })}
          />
        </View>
      </View>
    </View>
  );
}

function SectionTitle({ eyebrow, children }) {
  return (
    <View className="mb-8">
      <View className="mb-3 flex-row items-center gap-3">
        <View className="h-[2px] w-8 bg-carbon-blue" />
        {eyebrow ? (
          <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
            {eyebrow}
          </Text>
        ) : null}
      </View>
      <Text className="font-plexsemibold text-3xl leading-10 text-carbon-black dark:text-white">
        {children}
      </Text>
    </View>
  );
}
