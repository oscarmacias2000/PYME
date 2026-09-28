import { View, Text, Image } from 'react-native';

const _CLAUDE_ICON_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg fill="#D97757" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>')}`;

export default function PhoneMockup() {
  return (
    <View style={{
      width: 210, height: 430,
      borderWidth: 3, borderColor: '#1a1a1a',
      borderRadius: 36,
      backgroundColor: '#0d0d0d',
      alignItems: 'center',
      overflow: 'hidden',
      shadowColor: '#D97757',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 20,
    }}>
      {/* Dynamic Island */}
      <View style={{
        width: 60, height: 14, marginTop: 10,
        backgroundColor: '#000', borderRadius: 20,
        zIndex: 2,
      }} />
      {/* Botón derecho */}
      <View style={{
        position: 'absolute', right: -4, top: 70,
        width: 3, height: 38,
        backgroundColor: '#1a1a1a', borderRadius: 3,
      }} />
      {/* Botones izquierda */}
      {[56, 108, 150].map((top, i) => (
        <View key={i} style={{
          position: 'absolute', left: -4, top,
          width: 3, height: i === 0 ? 24 : 42,
          backgroundColor: '#1a1a1a', borderRadius: 3,
        }} />
      ))}

      {/* Status bar */}
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 6 }}>
        <Text style={{ color: '#ffffff', fontSize: 9, fontWeight: '600' }}>17:41</Text>
        <Text style={{ color: '#ffffff', fontSize: 9 }}>▲ ◾ 🔋</Text>
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: '#ffffff', fontSize: 10 }}>☰</Text>
        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600' }}>New chat</Text>
        <Text style={{ color: '#ffffff', fontSize: 10 }}>⊙</Text>
      </View>

      {/* Contenido central */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 }}>
        <Image
          source={{ uri: _CLAUDE_ICON_SVG }}
          style={{ width: 44, height: 44 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>Hi, I&apos;m Claude.</Text>
        <Text style={{ color: '#9ca3af', fontSize: 10, textAlign: 'center' }}>How can I help you today?</Text>
      </View>

      {/* Input bar */}
      <View style={{ width: '100%', paddingHorizontal: 12, paddingBottom: 20, gap: 8 }}>
        <View style={{ backgroundColor: '#1c1c1e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
          <Text style={{ color: '#6b7280', fontSize: 9 }}>Message Claude</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ backgroundColor: '#262626', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ color: '#9ca3af', fontSize: 8 }}>⬆ Claude Sonnet</Text>
          </View>
          <View style={{ backgroundColor: '#262626', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ color: '#9ca3af', fontSize: 8 }}>🔍 Search</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
