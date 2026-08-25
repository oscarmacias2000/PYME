import { View, Text } from 'react-native';

import BuildWiseLogo from './BuildWiseLogo';

const COLUMNS = [
  { title: 'Productos', items: ['Automatizacion', 'Apps con IA', 'Seguridad'] },
  { title: 'Empresa', items: ['Nosotros', 'Casos de exito', 'Blog'] },
  { title: 'Soporte', items: ['Contacto', 'Documentacion', 'Estado'] },
];

/**
 * Footer oscuro (gray-100) con columnas de enlaces, estilo IBM.
 */
export default function Footer() {
  return (
    <View className="w-full bg-carbon-black px-5 pb-10 pt-12">
      <View className="mx-auto w-full max-w-5xl">
        <BuildWiseLogo height={30} variant="light" />

        <View className="mt-8 flex-row flex-wrap gap-y-8">
          {COLUMNS.map((col) => (
            <View key={col.title} className="w-1/2 pr-4 md:w-1/4">
              <Text className="font-plexsemibold text-sm text-white">
                {col.title}
              </Text>
              {col.items.map((it) => (
                <Text
                  key={it}
                  className="mt-3 font-plex text-sm text-carbon-gray20"
                >
                  {it}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View className="mt-12 border-t border-carbon-gray90 pt-6">
          <Text className="font-plex text-xs text-carbon-gray50">
            © 2026 BuildWise Labs. Diseñamos sistemas inteligentes que automatizan
            operaciones y hacen crecer negocios.
          </Text>
        </View>
      </View>
    </View>
  );
}
