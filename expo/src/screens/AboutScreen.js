import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Photo from '../components/ui/Photo';
import { TEAM, ABOUT } from '../constants/team';
import { IMAGES } from '../constants/images';

export default function AboutScreen({ navigation }) {
  return (
    <Screen>
      {/* Intro */}
      <View className="pb-10 pt-14">
        <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
          Nosotros
        </Text>
        <Text className="mt-3 max-w-3xl font-plexlight text-4xl leading-10 text-carbon-black dark:text-white">
          El equipo detras de BuildWise Labs
        </Text>
        <Text className="mt-5 max-w-2xl font-plex text-lg leading-7 text-carbon-gray70 dark:text-carbon-gray20">
          {ABOUT.intro}
        </Text>
      </View>

      {/* Foto + mision */}
      <View className="mb-16 flex-row flex-wrap items-center gap-8">
        <View className="min-w-[280px] flex-1">
          <Photo uri={IMAGES.aboutOffice} height={300} />
        </View>
        <View className="min-w-[280px] flex-1">
          <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
            Nuestra mision
          </Text>
          <Text className="mt-3 max-w-md font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
            {ABOUT.mission}
          </Text>
        </View>
      </View>

      {/* Valores */}
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {ABOUT.values.map((v) => (
          <View key={v.id} className="min-w-[220px] flex-1 bg-white dark:bg-carbon-black p-6">
            <Ionicons name={v.icon} size={28} color="#c026d3" />
            <Text className="mt-4 font-plexsemibold text-lg text-carbon-black dark:text-white">
              {v.title}
            </Text>
            <Text className="mt-2 font-plex text-sm leading-5 text-carbon-gray70 dark:text-carbon-gray20">
              {v.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Equipo */}
      <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
        Conoce al equipo
      </Text>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {TEAM.map((m) => (
          <View key={m.id} className="min-w-[180px] max-w-[260px] flex-1 basis-[22%] bg-white dark:bg-carbon-black">
            <View className="w-full bg-carbon-gray20 dark:bg-carbon-gray90" style={{ height: 220 }}>
              <Image
                source={typeof m.photo === 'string' ? { uri: m.photo } : m.photo}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <View className="p-4">
              <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">
                {m.name}
              </Text>
              <Text className="mt-1 font-plex text-sm text-carbon-blue">
                {m.role}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View className="mb-16 flex-row flex-wrap items-center justify-between gap-4 bg-carbon-black p-8">
        <Text className="max-w-[420px] font-plexlight text-2xl leading-8 text-white">
          Quieres que trabajemos juntos?
        </Text>
        <Button
          label="Contactar"
          onPress={() => navigation.navigate('Contacto')}
        />
      </View>
    </Screen>
  );
}
