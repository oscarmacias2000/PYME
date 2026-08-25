import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Boton Carbon (IBM): rectangular, texto a la izquierda e icono a la derecha.
 * @param {'primary'|'tertiary'|'ghost'|'outlineWhite'} variant
 *   outlineWhite: borde y texto blancos; al hover se rellena de blanco con
 *   texto oscuro (pensado para fondos oscuros, p. ej. el hero).
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  icon = 'arrow-forward',
  className = '',
}) {
  // primary = magenta (relleno); tertiary = azul electrico (outline).
  const container = {
    primary: 'bg-carbon-blue hover:bg-carbon-bluehover',
    tertiary:
      'border border-carbon-electric bg-transparent hover:bg-carbon-electric',
    ghost: 'bg-transparent',
    outlineWhite: 'border border-white bg-transparent hover:bg-white',
  };

  const text = {
    primary: 'text-white',
    tertiary: 'text-carbon-electric',
    ghost: 'text-carbon-blue',
    outlineWhite: 'text-white hover:text-carbon-black',
  };

  const iconColor =
    variant === 'primary' || variant === 'outlineWhite'
      ? '#ffffff'
      : variant === 'tertiary'
        ? '#2f6bf5'
        : '#c026d3';

  return (
    <Pressable
      onPress={onPress}
      className={`min-w-[180px] flex-row items-center justify-between px-4 py-3 active:opacity-90 ${container[variant]} ${className}`}
    >
      <Text className={`mr-8 font-plex text-[15px] ${text[variant]}`}>
        {label}
      </Text>
      {icon ? (
        <View pointerEvents="none">
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
    </Pressable>
  );
}
