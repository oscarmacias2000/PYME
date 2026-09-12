import { View, Platform } from 'react-native';

// Renders SVG string inline on web (bypasses Image data-URI issues with complex SVGs)
export default function SvgIcon({ svg, size = 52, bg = '#ffffff', radius = 8, borderColor = '#e0e0e0' }) {
  return (
    <View style={{
      width: size + 20, height: size + 20,
      backgroundColor: bg,
      borderRadius: radius,
      borderWidth: 1, borderColor,
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {Platform.OS === 'web' ? (
        <div
          style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          dangerouslySetInnerHTML={{ __html: svg.replace(/<svg /, `<svg width="${size}" height="${size}" `) }}
        />
      ) : (
        <View style={{ width: size, height: size, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
      )}
    </View>
  );
}
