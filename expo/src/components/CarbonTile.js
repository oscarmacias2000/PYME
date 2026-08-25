import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

/**
 * Tile Carbon (IBM): imagen a todo el ancho arriba, contenido y flecha
 * inferior. Borde que pasa a magenta al hover. Esquinas rectas.
 */
export default function CarbonTile({ service, onPress }) {
  const { colorScheme } = useColorScheme();
  const arrow = colorScheme === 'dark' ? '#f4f4f4' : '#161616';
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[300px] flex-1 justify-between border border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black hover:border-carbon-blue active:opacity-90"
    >
      <View>
        {/* Imagen del servicio a todo el ancho */}
        {service.image ? (
          <View className="w-full bg-carbon-gray20 dark:bg-carbon-gray90" style={{ height: 150 }}>
            <Image
              source={{ uri: service.image }}
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        ) : null}

        <View className="p-5">
          <Ionicons name={service.icon} size={26} color="#c026d3" />
          <Text className="mt-4 font-plexsemibold text-xl text-carbon-black dark:text-white">
            {service.title}
          </Text>
          <Text className="mt-2 font-plex text-sm leading-5 text-carbon-gray70 dark:text-carbon-gray20">
            {service.description}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-end px-5 pb-5">
        <Ionicons name="arrow-forward" size={20} color={arrow} />
      </View>
    </Pressable>
  );
}
