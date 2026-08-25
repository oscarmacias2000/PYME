import { Image, View } from 'react-native';

/**
 * Imagen con fondo placeholder (gris Carbon) mientras carga.
 * @param {string} uri
 * @param {number} height  alto en px (el ancho es 100%)
 */
export default function Photo({ uri, height = 220, className = '', rounded }) {
  return (
    <View
      className={`w-full overflow-hidden bg-carbon-gray20 dark:bg-carbon-gray90 ${className}`}
      style={{ height, borderRadius: rounded ? 0 : 0 }}
    >
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
