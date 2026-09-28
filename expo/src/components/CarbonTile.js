import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import ServiceArt from './ServiceArt';

/**
 * Tile Carbon (IBM): ilustracion de marca a todo el ancho arriba, contenido
 * y flecha inferior. Borde que pasa a malva al hover. Esquinas rectas.
 */
export default function CarbonTile({ service, onPress, index = 0 }) {
  const { colorScheme } = useColorScheme();
  const arrow = colorScheme === 'dark' ? '#f4f4f4' : '#161616';
  return (
    <Pressable
      onPress={onPress}
      className="min-h-[300px] flex-1 justify-between border border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black hover:border-carbon-blue active:opacity-90"
    >
      <View>
        {/* Ilustracion con el logotipo de BuildWise */}
        <ServiceArt service={service} height={150} seed={index + 1} />

        <View className="p-5">
          <Ionicons name={service.icon} size={26} color="#9d6b99" />
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
