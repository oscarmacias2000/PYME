import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useColorScheme } from 'nativewind';

import { TECH_ICONS } from '../../constants/techIcons';

// Marcas que Simple Icons ya no incluye: se dibujan con un icono generico en su color.
const EXTRA = {
  excel: { title: 'Excel', hex: '217346', ionicon: 'grid' },
};

// Logotipos casi negros (Expo, Anthropic, Ollama...) se aclaran en modo oscuro.
function isDark(hex) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
}

export const getTech = (id) => TECH_ICONS[id] || EXTRA[id] || null;

// Color del logotipo segun el fondo: los casi negros se aclaran sobre fondo oscuro.
export const techColor = (tech, onDark) => (onDark && isDark(tech.hex) ? '#f4f4f4' : `#${tech.hex}`);

/** Solo el logotipo de una tecnologia, a cualquier tamano. */
export function TechLogo({ id, size = 15, onDark = false }) {
  const tech = getTech(id);
  if (!tech) return null;
  const color = techColor(tech, onDark);
  return tech.ionicon ? (
    <Ionicons name={tech.ionicon} size={size} color={color} />
  ) : (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={tech.path} fill={color} />
    </Svg>
  );
}

function TechChip({ id, dark }) {
  const [hover, setHover] = useState(false);
  const tech = getTech(id);
  if (!tech) return null;
  const color = techColor(tech, dark);

  return (
    <Pressable
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityLabel={tech.title}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 28,
        paddingHorizontal: 7,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: hover ? color : dark ? '#393939' : '#e0e0e0',
        backgroundColor: dark ? '#1e1e1e' : '#f4f4f4',
      }}
    >
      <TechLogo id={id} size={15} onDark={dark} />
      {hover ? <Text style={{ fontSize: 11, fontWeight: '600', color: dark ? '#f4f4f4' : '#161616' }}>{tech.title}</Text> : null}
    </Pressable>
  );
}

/**
 * Fila de logotipos de tecnologias. En web, al pasar el mouse cada chip
 * muestra el nombre de la tecnologia.
 * @param {string[]} items  claves de constants/techIcons.js (o 'excel')
 */
export default function TechStack({ items = [] }) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {items.map((id) => (
        <TechChip key={id} id={id} dark={dark} />
      ))}
    </View>
  );
}
