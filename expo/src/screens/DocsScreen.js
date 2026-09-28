import { View, Text, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import { DOCS } from '../constants/docs';
import { FAQS, PROCESS_STEPS } from '../constants/home';
import { OWN_DOCS } from '../constants/ownDocs';
import { DOC_COVERS, DOC_COVER_IMAGES } from '../constants/docCovers';
import DocCover from '../components/ui/DocCover';

const MONO = Platform.select({ web: 'ui-monospace, Menlo, Consolas, monospace', default: 'monospace' });

export default function DocsScreen({ route, navigation }) {
  const focus = route?.params?.focus; // seccion abierta desde el menu

  return (
    <Screen>
      {/* Encabezado */}
      <View className="pb-8 pt-14">
        <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
          Documentación
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
                <Ionicons name={d.icon} size={26} color="#9d6b99" />
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

                {d.sections?.map((s, i) => <DocBlock key={s.heading || i} block={s} />)}

                {d.process
                  ? PROCESS_STEPS.map((p, i) => (
                      <DocBlock
                        key={p.id}
                        block={{
                          heading: `${String(i + 1).padStart(2, '0')} · ${p.title} (${p.duration})`,
                          text: p.description,
                          list: p.deliverables,
                        }}
                      />
                    ))
                  : null}

                {d.faq
                  ? FAQS.map((f) => <DocBlock key={f.q} block={{ heading: f.q, text: f.a }} />)
                  : null}
              </View>
            </View>
          );
        })}
      </View>

      {/* Documentacion propia del equipo (md/ -> npm run docs:sync) */}
      <View className="mb-16">
        <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
          Guías del equipo
        </Text>
        <Text className="mt-2 font-plexlight text-2xl text-carbon-black dark:text-white">
          Documentación propia y prompts
        </Text>
        <View className="mt-6 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
          {Object.values(OWN_DOCS).map((d, i) => (
            <Pressable
              key={d.id}
              onPress={() => navigation.navigate('Documento', { id: d.id })}
              accessibilityRole="link"
              className="min-w-[240px] flex-1 basis-[30%] overflow-hidden bg-white hover:bg-carbon-gray10 dark:bg-carbon-black dark:hover:bg-carbon-gray90"
            >
              <DocCover
                logos={DOC_COVERS[d.id]}
                image={DOC_COVER_IMAGES[d.id]}
                badge={/prompt/i.test(d.title) ? 'PROMPTS' : 'GUÍA'}
                sections={d.topics.length ? `${d.topics.length} secciones` : null}
                seed={i * 7 + 3}
              />
              <View className="p-5">
                <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">{d.title}</Text>
                <View className="mt-2 flex-row items-center gap-1">
                  <Ionicons name="document-text-outline" size={13} color="#8d8d8d" />
                  <Text className="font-plex text-xs text-carbon-gray50">{d.file}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

/** Bloque de contenido: subtitulo, parrafo, vinetas y/o ejemplo de codigo. */
function DocBlock({ block }) {
  return (
    <View className="mt-6 max-w-2xl">
      {block.heading ? (
        <Text className="font-plexsemibold text-base text-carbon-black dark:text-white">
          {block.heading}
        </Text>
      ) : null}
      {block.text ? (
        <Text className="mt-1 font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
          {block.text}
        </Text>
      ) : null}
      {block.list?.map((item) => (
        <View key={item} className="mt-2 flex-row gap-2">
          <Text className="font-plex text-base leading-6 text-carbon-blue">•</Text>
          <Text className="flex-1 font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
            {item}
          </Text>
        </View>
      ))}
      {block.code ? (
        <View className="mt-3 border-l-2 border-carbon-blue bg-carbon-gray10 px-4 py-3 dark:bg-carbon-black">
          <Text
            style={{ fontFamily: MONO }}
            className="text-[13px] leading-5 text-carbon-black dark:text-carbon-gray20"
          >
            {block.code}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
