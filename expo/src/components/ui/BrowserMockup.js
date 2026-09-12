import { View, Text, Image } from 'react-native';

export default function BrowserMockup({ uri, height = 320, url = 'localhost:8081' }) {
  return (
    <View style={{ marginTop: 12, borderWidth: 1, borderColor: '#393939', overflow: 'hidden' }}>
      {/* Barra del navegador */}
      <View style={{ backgroundColor: '#262626', paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {/* Botones semaforo */}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#da1e28' }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#f1c21b' }} />
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#24a148' }} />
        </View>
        {/* Barra de URL */}
        <View style={{ flex: 1, backgroundColor: '#161616', borderRadius: 3, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#8d8d8d' }}>
            {url}
          </Text>
        </View>
      </View>

      {/* Pantalla */}
      <View style={{ height, backgroundColor: '#f4f4f4' }}>
        {uri ? (
          <Image
            source={{ uri }}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>🖥️</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#8d8d8d', fontFamily: 'monospace' }}>
              preview
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
