import { View, Text, Image } from 'react-native';

/**
 * Avatar cuadrado (estilo Carbon). Muestra una foto si se pasa `photo`;
 * si no, las iniciales sobre un color de fondo.
 */
export default function Avatar({
  initials = '?',
  size = 32,
  photo = null,
  bg = '#c026d3',
}) {
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size }}
        resizeMode="cover"
        accessibilityLabel="Foto de perfil"
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, backgroundColor: bg }}
      className="items-center justify-center"
    >
      <Text style={{ fontSize: size * 0.42 }} className="font-plexsemibold text-white">
        {initials}
      </Text>
    </View>
  );
}
