import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import { SERVICES } from '../constants/services';

export default function ServicesScreen({ navigation }) {
  return (
    <Screen>
      {/* Encabezado */}
      <View className="pb-10 pt-14">
        <Text className="font-plexlight text-4xl leading-10 text-carbon-black dark:text-white">
          Servicios
        </Text>
        <Text className="mt-4 max-w-2xl font-plex text-lg leading-7 text-carbon-gray70 dark:text-carbon-gray20">
          Soluciones tecnologicas integradas para cada etapa de tu PYME. Entra a
          cada servicio para ver el detalle.
        </Text>
      </View>

      {/* Grid de cards con imagen a todo el ancho */}
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {SERVICES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => navigation.navigate('Servicio', { id: s.id })}
            className="min-w-[280px] flex-1 basis-[45%] bg-white dark:bg-carbon-black hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
          >
            {/* Imagen a todo el ancho */}
            <View className="w-full bg-carbon-gray20 dark:bg-carbon-gray90" style={{ height: 170 }}>
              <Image
                source={{ uri: s.image }}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>

            <View className="p-6">
              <View className="flex-row items-center gap-2">
                <Ionicons name={s.icon} size={22} color="#c026d3" />
                <Text className="font-plex text-sm text-carbon-blue">
                  {s.tagline}
                </Text>
              </View>
              <Text className="mt-2 font-plexsemibold text-xl text-carbon-black dark:text-white">
                {s.title}
              </Text>
              <Text className="mt-2 font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
                {s.description}
              </Text>

              <View className="mt-4 flex-row items-center gap-2">
                <Text className="font-plex text-sm text-carbon-blue">
                  Ver detalle
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#c026d3" />
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
