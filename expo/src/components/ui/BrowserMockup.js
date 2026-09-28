import { View, Text, Image } from 'react-native';

const MARK = require('../../../assets/buildwise-mark.png');

/** Ventana de navegador con la marca de BuildWise (captura o marcador). */
export default function BrowserMockup({ uri, height = 320, url = 'buildwiselabs.net' }) {
  return (
    <View
      style={{ marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' }}
    >
      {/* Barra del navegador */}
      <View
        style={{ backgroundColor: '#151824', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}
      >
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {['#e57373', '#e8c68e', '#78c8a0'].map((c) => (
            <View key={c} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
          ))}
        </View>
        {/* Barra de URL con el simbolo como favicon */}
        <View
          style={{
            flex: 1,
            backgroundColor: '#0c0e14',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Image source={MARK} style={{ width: 12, height: 12 }} resizeMode="contain" />
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#8d93a8' }}>{url}</Text>
        </View>
      </View>

      {/* Pantalla */}
      <View style={{ height, backgroundColor: '#0c0e14' }}>
        {uri ? (
          <Image source={{ uri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Image source={MARK} style={{ width: 56, height: 56 }} resizeMode="contain" />
            <Text style={{ fontSize: 12, color: '#8d93a8', letterSpacing: 2 }}>BUILDWISE LABS</Text>
          </View>
        )}
      </View>
    </View>
  );
}
