import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import { DOCS } from '../constants/docs';

export default function DocsScreen({ route }) {
  const focus = route?.params?.focus; // seccion abierta desde el menu

  return (
    <Screen>
      {/* Encabezado */}
      <View className="pb-8 pt-14">
        <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
          Documentacion
        </Text>
        <Text className="mt-3 font-plexlight text-4xl leading-10 text-carbon-black dark:text-white">
          Docs de BuildWise Labs
        </Text>
        <Text className="mt-4 max-w-2xl font-plex text-lg leading-7 text-carbon-gray70 dark:text-carbon-gray20">
          Todo lo que necesitas para empezar a automatizar tu negocio.
        </Text>
      </View>

      {/* Secciones */}
      <View className="mb-16 border-t border-carbon-gray20 dark:border-carbon-gray90">
        {DOCS.map((d) => {
          const active = focus === d.id;
          return (
            <View
              key={d.id}
              className={`flex-row flex-wrap items-start gap-6 border-b border-carbon-gray20 dark:border-carbon-gray90 py-8 ${
                active ? 'border-l-4 border-l-carbon-blue bg-carbon-gray10 dark:bg-carbon-gray90 pl-4' : ''
              }`}
            >
              <View className="h-12 w-12 items-center justify-center bg-white dark:bg-carbon-black">
                <Ionicons name={d.icon} size={26} color="#c026d3" />
              </View>
              <View className="min-w-[240px] flex-1">
                <Text className="font-plexsemibold text-xl text-carbon-black dark:text-white">
                  {d.title}
                </Text>
                <Text className="mt-1 font-plex text-sm text-carbon-blue">
                  {d.description}
                </Text>
                <Text className="mt-3 max-w-2xl font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
                  {d.body}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
