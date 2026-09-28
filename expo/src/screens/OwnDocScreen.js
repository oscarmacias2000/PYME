import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import MarkdownView from '../components/MarkdownView';
import { OWN_DOCS } from '../constants/ownDocs';

/**
 * Documento propio del equipo (generado desde md/ con `npm run docs:sync`).
 * Ruta: /docs/:id
 */
export default function OwnDocScreen({ route, navigation }) {
  const doc = OWN_DOCS[route?.params?.id];
  const back = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Docs'));

  if (!doc) {
    return (
      <Screen>
        <View className="pb-16 pt-14">
          <Text className="font-plexlight text-3xl text-carbon-black dark:text-white">
            Documento no encontrado
          </Text>
          <Pressable onPress={() => navigation.navigate('Docs')} className="mt-6 self-start">
            <Text className="font-plex text-base text-carbon-blue">Ver toda la documentación</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="mx-auto w-full max-w-3xl pb-16 pt-10">
        <Pressable onPress={back} className="mb-8 flex-row items-center gap-1.5 self-start">
          <Ionicons name="arrow-back" size={16} color="#9d6b99" />
          <Text className="font-plex text-sm text-carbon-blue">Volver</Text>
        </Pressable>

        <View className="mb-8 border-b border-carbon-gray20 pb-6 dark:border-carbon-gray90">
          <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
            Documentación del equipo
          </Text>
          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full bg-carbon-gray10 px-3 py-1 dark:bg-carbon-gray90">
              <Ionicons name="document-text-outline" size={13} color="#8d8d8d" />
              <Text className="font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">{doc.file}</Text>
            </View>
            {doc.topics.length ? (
              <Text className="font-plex text-xs text-carbon-gray50">{doc.topics.length} secciones</Text>
            ) : null}
          </View>
        </View>

        <MarkdownView content={doc.content} />
      </View>
    </Screen>
  );
}
