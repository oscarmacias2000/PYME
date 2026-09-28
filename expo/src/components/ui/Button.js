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
    // Pildoras estilo "Astra" (para fondos espaciales oscuros).
    pill: 'rounded-full bg-white hover:bg-carbon-gray20',
    pillDark: 'rounded-full border border-white/15 bg-white/10 hover:bg-white/20',
  };

  const isPill = variant === 'pill' || variant === 'pillDark';

  const text = {
    primary: 'text-white',
    tertiary: 'text-carbon-electric',
    ghost: 'text-carbon-blue',
    outlineWhite: 'text-white hover:text-carbon-black',
    pill: 'text-carbon-black',
    pillDark: 'text-white',
  };

  const iconColor =
    variant === 'pill'
      ? '#161616'
      : variant === 'primary' || variant === 'outlineWhite' || variant === 'pillDark'
      ? '#ffffff'
      : variant === 'tertiary'
        ? '#7088b3'
        : '#9d6b99';

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center active:opacity-90 ${
        isPill
          ? 'justify-center gap-2 px-6 py-3'
          : 'min-w-[180px] justify-between px-4 py-3'
      } ${container[variant]} ${className}`}
    >
      <Text
        className={`${isPill ? 'font-plexsemibold' : 'mr-8 font-plex'} text-[15px] ${text[variant]}`}
      >
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
