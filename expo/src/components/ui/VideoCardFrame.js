import { View, Text, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WEB = Platform.OS === 'web';

/**
 * Marco visual compartido de VideoCard (web y nativo): video, badges, controles
 * de reproducir/pausar y sonido, titulo y boton opcional de "Ver en grande".
 * @param {React.ReactNode} media  el elemento de video ya montado
 * @param {boolean} portrait       video vertical a la izquierda y texto a la derecha
 */
export default function VideoCardFrame({
  media,
  title,
  subtitle,
  badges = [],
  aspectRatio = 16 / 9,
  portrait = false,
  playing,
  muted,
  onToggle,
  onMute,
  onExpand,
}) {
  const controls = (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <Pressable onPress={onToggle} accessibilityLabel={playing ? 'Pausar video' : 'Reproducir video'} style={controlStyle}>
        <Ionicons name={playing ? 'pause' : 'play'} size={14} color="#fff" />
      </Pressable>
      <Pressable onPress={onMute} accessibilityLabel={muted ? 'Activar sonido' : 'Silenciar'} style={controlStyle}>
        <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={14} color="#fff" />
      </Pressable>
    </View>
  );

  const badgeRow = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {badges.map((b) => (
        <View
          key={b.label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: b.color || 'rgba(12,14,20,0.7)',
            borderWidth: b.color ? 0 : 1,
            borderColor: 'rgba(255,255,255,0.15)',
          }}
        >
          {b.icon && <Ionicons name={b.icon} size={10} color="#fff" />}
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 }}>{b.label}</Text>
        </View>
      ))}
    </View>
  );

  const expand = onExpand ? (
    <Pressable
      onPress={onExpand}
      style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
    >
      <Ionicons name="expand-outline" size={13} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Ver en grande</Text>
    </Pressable>
  ) : null;

  const shell = {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#151824',
    ...(WEB ? { boxShadow: '0 18px 50px rgba(157,107,153,0.25)' } : {}),
  };

  if (portrait) {
    return (
      <View style={[shell, { flexDirection: 'row' }]}>
        <View style={{ width: 150, aspectRatio, backgroundColor: '#000' }}>{media}</View>
        <View style={{ flex: 1, padding: 14, gap: 10, justifyContent: 'space-between' }}>
          <View style={{ gap: 10 }}>
            {badgeRow}
            <View>
              {title ? <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', lineHeight: 20 }}>{title}</Text> : null}
              {subtitle ? <Text style={{ color: '#a8b0c4', fontSize: 12, lineHeight: 17, marginTop: 4 }}>{subtitle}</Text> : null}
            </View>
          </View>
          <View style={{ gap: 10 }}>
            {controls}
            {expand}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={shell}>
      <View style={{ width: '100%', aspectRatio, backgroundColor: '#000' }}>
        {media}
        <View style={{ position: 'absolute', top: 10, left: 10, right: 90 }}>{badgeRow}</View>
        <View style={{ position: 'absolute', top: 10, right: 10 }}>{controls}</View>
      </View>
      {(title || subtitle || expand) && (
        <View style={{ paddingHorizontal: 14, paddingVertical: 12, gap: 10, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{title}</Text> : null}
            {subtitle ? <Text style={{ color: '#a8b0c4', fontSize: 11, marginTop: 2 }}>{subtitle}</Text> : null}
          </View>
          {expand}
        </View>
      )}
    </View>
  );
}

const controlStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(12,14,20,0.55)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
};
