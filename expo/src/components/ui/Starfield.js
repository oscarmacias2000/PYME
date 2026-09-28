import { useMemo } from 'react';
import { View } from 'react-native';

// Generador pseudoaleatorio con semilla: las estrellas quedan siempre en el
// mismo lugar entre renders (y entre servidor/cliente en web).
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Cielo estrellado de fondo (estilo "Astra"): puntos pequenos en posiciones
 * fijas y un resplandor central tenue. Se coloca como capa absoluta.
 * @param {number} count  numero de estrellas
 * @param {number} seed   semilla para variar la distribucion
 * @param {boolean} glow  muestra el resplandor central
 */
export default function Starfield({ count = 90, seed = 7, glow = true }) {
  const stars = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      left: `${rnd() * 100}%`,
      top: `${rnd() * 100}%`,
      size: rnd() < 0.85 ? 1.5 : 2.5,
      opacity: 0.25 + rnd() * 0.65,
      blue: rnd() < 0.3,
    }));
  }, [count, seed]);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
    >
      {glow ? (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
          {/* Muchos circulos muy tenues apilados = degradado radial suave */}
          {Array.from({ length: 12 }, (_, i) => 1000 - i * 70).map((d) => (
            <View
              key={d}
              style={{
                position: 'absolute',
                width: d,
                height: d,
                borderRadius: d / 2,
                backgroundColor: '#16223d',
                opacity: 0.09,
              }}
            />
          ))}
        </View>
      ) : null}
      {stars.map((s) => (
        <View
          key={s.key}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size,
            backgroundColor: s.blue ? '#93a4c2' : '#ffffff',
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}
