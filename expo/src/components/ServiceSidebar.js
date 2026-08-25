import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { SERVICES } from '../constants/services';

// Sub-secciones que se muestran como hijos de cada servicio (estilo TOC).
const SECTIONS = ['Que hacemos', 'Que incluye', 'Otros servicios'];

/**
 * Sidebar tipo TOC de IBM docs: arbol de servicios con items expandibles
 * (chevron por item), hijos indentados y el servicio actual resaltado.
 */
export default function ServiceSidebar({ currentId, navigation }) {
  const [expanded, setExpanded] = useState(currentId); // id del nodo abierto

  return (
    <View className="w-full self-start border border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black md:w-[260px]">
      <Text className="border-b border-carbon-gray20 dark:border-carbon-gray90 px-4 py-3 font-plexsemibold text-xs uppercase tracking-wide text-carbon-gray70 dark:text-carbon-gray20">
        Servicios
      </Text>

      {SERVICES.map((s) => {
        const active = s.id === currentId;
        const isOpen = expanded === s.id;
        return (
          <View key={s.id}>
            {/* Fila del nodo: label (link) + chevron (expandir) */}
            <View
              className={`flex-row items-stretch ${
                active
                  ? 'border-l-4 border-carbon-blue bg-carbon-gray10 dark:bg-carbon-gray90'
                  : 'border-l-4 border-transparent'
              }`}
            >
              <Pressable
                className="flex-1 py-3 pl-3 pr-2 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                onPress={() => navigation.navigate('Servicio', { id: s.id })}
              >
                <Text
                  className={`font-plex text-sm ${
                    active
                      ? 'font-plexsemibold text-carbon-blue'
                      : 'text-carbon-black dark:text-white'
                  }`}
                >
                  {s.title}
                </Text>
              </Pressable>
              <Pressable
                className="items-center justify-center px-3 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                accessibilityLabel={isOpen ? 'Contraer' : 'Expandir'}
                onPress={() => setExpanded(isOpen ? null : s.id)}
              >
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#8d8d8d"
                />
              </Pressable>
            </View>

            {/* Hijos (secciones) indentados */}
            {isOpen ? (
              <View className="pb-1">
                {SECTIONS.map((sec) => (
                  <Pressable
                    key={sec}
                    onPress={() => navigation.navigate('Servicio', { id: s.id })}
                    className="ml-6 border-l border-carbon-gray20 dark:border-carbon-gray90 py-2 pl-4 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
                  >
                    <Text className="font-plex text-[13px] text-carbon-gray70 dark:text-carbon-gray20">
                      {sec}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
