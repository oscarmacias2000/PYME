import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Photo from '../components/ui/Photo';
import CarbonTile from '../components/CarbonTile';
import HeroSpace from '../components/HeroSpace';
import { SERVICES, RECOMMENDED, PRODUCTS, CASES } from '../constants/services';
import { IMAGES } from '../constants/images';

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
      <View className="pt-12" />
      <SectionTitle>Recomendado para ti</SectionTitle>
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
      <SectionTitle>Nuestros servicios</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {SERVICES.map((s) => (
          <View key={s.id} className="min-w-[260px] flex-1 basis-[45%]">
            <CarbonTile
              service={s}
              onPress={() => navigation.navigate('Servicio', { id: s.id })}
            />
          </View>
        ))}
      </View>

      {/* TEASER NOSOTROS con foto */}
      <View className="mb-16 flex-row flex-wrap items-center gap-8 bg-carbon-gray10 dark:bg-carbon-gray90 p-8">
        <View className="min-w-[280px] flex-1">
          <Photo uri={IMAGES.aboutMeeting} height={260} />
        </View>
        <View className="min-w-[280px] flex-1">
          <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
            Un equipo cercano y tecnico
          </Text>
          <Text className="mt-3 max-w-md font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
            Somos el equipo detras de BuildWise Labs: desarrolladores, especialistas
            en automatizacion y seguridad que acompanan cada proyecto de
            principio a fin.
          </Text>
          <Button
            label="Sobre nosotros"
            variant="tertiary"
            className="mt-6 self-start"
            onPress={() => navigation.navigate('Nosotros')}
          />
        </View>
      </View>

      {/* PRODUCTOS */}
      <SectionTitle>Tecnologia de vanguardia para tu negocio</SectionTitle>
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

      {/* CASOS / METRICAS */}
      <View className="mb-16 bg-carbon-gray10 dark:bg-carbon-gray90 p-8">
        <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
          Impacto medible
        </Text>
        <View className="mt-8 flex-row flex-wrap gap-y-8">
          {CASES.map((c) => (
            <View key={c.id} className="min-w-[200px] flex-1 pr-4">
              <Text className="font-plexlight text-5xl text-carbon-electric">
                {c.metric}
              </Text>
              <Text className="mt-3 max-w-[200px] font-plex text-sm leading-5 text-carbon-gray70 dark:text-carbon-gray20">
                {c.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA FINAL */}
      <View className="mb-16 flex-row flex-wrap items-center justify-between gap-4 bg-carbon-black p-8">
        <Text className="max-w-[420px] font-plexlight text-2xl leading-8 text-white">
          Empecemos a construir la proxima etapa de tu empresa
        </Text>
        <Button
          label="Contactar"
          onPress={() => navigation.navigate('Contacto')}
        />
      </View>
    </Screen>
  );
}

function SectionTitle({ children }) {
  return (
    <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
      {children}
    </Text>
  );
}
