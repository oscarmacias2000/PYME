import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Svg, { Circle, Ellipse, Path, Polygon } from 'react-native-svg';

// Logotipos simplificados que Ionicons no incluye (colores de marca).
function Safari({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill="#1a8cff" />
      <Circle cx={12} cy={12} r={8.5} fill="none" stroke="#ffffff" strokeWidth={0.8} strokeDasharray="1 1.6" />
      <Polygon points="12,12 17.5,6.5 13.4,13.4" fill="#ff3b30" />
      <Polygon points="12,12 6.5,17.5 10.6,10.6" fill="#ffffff" />
    </Svg>
  );
}
function Opera({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse cx={12} cy={12} rx={9} ry={10.5} fill="none" stroke="#ff1b2d" strokeWidth={3.6} />
      <Ellipse cx={12} cy={12} rx={3.6} ry={7.6} fill="none" stroke="#a70014" strokeWidth={1.4} />
    </Svg>
  );
}
function Ubuntu({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11.5} fill="#e95420" />
      <Circle cx={12} cy={12} r={5.4} fill="none" stroke="#ffffff" strokeWidth={1.9} />
      {[0, 120, 240].map((a) => {
        const r = (a * Math.PI) / 180;
        return <Circle key={a} cx={12 + Math.cos(r) * 7.2} cy={12 + Math.sin(r) * 7.2} r={1.9} fill="#ffffff" stroke="#e95420" strokeWidth={0.9} />;
      })}
    </Svg>
  );
}
function Debian({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M13.2 3.2c-5 -.4-8.9 3.4-8.9 8.2 0 4.6 3.6 8.4 8.2 8.4 2.2 0 4-.8 5.4-2.1-1.4.7-3 .9-4.6.5-3.4-.9-5.4-4.3-4.5-7.6.7-2.5 3-4.2 5.5-4.1 2.3.1 4 1.9 4 4.1 0 1.9-1.5 3.4-3.3 3.4-1.4 0-2.5-1.1-2.5-2.5 0-1 .8-1.8 1.8-1.8"
        fill="none"
        stroke="#a81d33"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// nombre (en minusculas) -> Ionicon + color, o componente SVG propio.
const BRANDS = {
  windows: { icon: 'logo-windows', color: '#0078d4' },
  macos: { icon: 'logo-apple', color: null },
  ios: { icon: 'logo-apple', color: null },
  android: { icon: 'logo-android', color: '#3ddc84' },
  linux: { icon: 'logo-tux', color: null },
  chrome: { icon: 'logo-chrome', color: '#4285f4' },
  edge: { icon: 'logo-edge', color: '#0c8fd8' },
  firefox: { icon: 'logo-firefox', color: '#ff7139' },
  safari: { svg: Safari },
  opera: { svg: Opera },
  ubuntu: { svg: Ubuntu },
  debian: { svg: Debian },
};

/** ¿Hay logotipo para este texto? (usa la primera palabra: "Windows 11" -> windows). */
export const hasBrandIcon = (name) => !!BRANDS[String(name).trim().split(/\s+/)[0].toLowerCase()];

/** Logotipo de un sistema operativo o navegador por su nombre. */
export default function BrandIcon({ name, size = 16 }) {
  const { colorScheme } = useColorScheme();
  const b = BRANDS[String(name).trim().split(/\s+/)[0].toLowerCase()];
  if (!b) return null;
  if (b.svg) {
    const C = b.svg;
    return <C size={size} />;
  }
  // Apple y Tux sin color de marca: siguen el tema (negro/blanco).
  const color = b.color || (colorScheme === 'dark' ? '#f4f4f4' : '#161616');
  return <Ionicons name={b.icon} size={size} color={color} />;
}
