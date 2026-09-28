import { View, Text, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Starfield from './Starfield';
import { TechLogo, getTech, techColor } from './TechStack';

const MARK = require('../../../assets/buildwise-mark.png');
const WEB = Platform.OS === 'web';

/**
 * Portada de tarjeta de documento: cielo estrellado de marca con los logotipos
 * de la tecnologia (o el de BuildWise) y badges de tipo y numero de secciones.
 * @param {string[]} logos   claves de techIcons.js
 * @param {number}   image   logotipo propio (require de imagen); va sobre un
 *                           chip claro para que se lea sobre el fondo oscuro.
 */
export default function DocCover({ logos = [], image, badge, sections, seed = 3, height = 128 }) {
  const main = logos.map(getTech).find(Boolean);
  // Resplandor del color de la marca principal detras del logotipo.
  const glow = image ? '#9d6b99' : main ? techColor(main, true) : '#9d6b99';

  return (
    <View style={{ height, backgroundColor: '#0c0e14', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Starfield count={36} seed={seed} glow={false} />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: 90,
          opacity: 0.35,
          ...(WEB
            ? { backgroundImage: `radial-gradient(circle, ${glow} 0%, transparent 65%)` }
            : { backgroundColor: glow, opacity: 0.12 }),
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        {image ? (
          <View style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: '#ffffff' }}>
            <Image source={image} style={{ width: 150, height: 58 }} resizeMode="contain" />
          </View>
        ) : logos.length ? (
          logos.map((id, i) => (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
              {i > 0 ? <Ionicons name="add" size={16} color="rgba(255,255,255,0.4)" /> : null}
              <TechLogo id={id} size={i === 0 ? 46 : 36} onDark />
            </View>
          ))
        ) : (
          <Image source={MARK} style={{ width: 52, height: 52 }} resizeMode="contain" />
        )}
      </View>

      {badge ? (
        <View style={[pill, { position: 'absolute', top: 10, left: 10, backgroundColor: '#9d6b99', borderWidth: 0 }]}>
          <Text style={pillText}>{badge}</Text>
        </View>
      ) : null}
      {sections ? (
        <View style={[pill, { position: 'absolute', top: 10, right: 10 }]}>
          <Ionicons name="list" size={10} color="#fff" />
          <Text style={pillText}>{sections}</Text>
        </View>
      ) : null}
    </View>
  );
}

const pill = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 999,
  backgroundColor: 'rgba(12,14,20,0.7)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
};
const pillText = { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 };
