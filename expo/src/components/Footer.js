import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SOCIALS = [
  { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/buildwiselabs' },
  { icon: 'logo-linkedin',  label: 'LinkedIn',  url: 'https://linkedin.com/company/buildwiselabs' },
  { icon: 'logo-github',    label: 'GitHub',    url: 'https://github.com/buildwiselabs' },
  { icon: 'logo-whatsapp', label: 'WhatsApp',  url: 'https://wa.me/521XXXXXXXXXX' },
];

export default function Footer() {
  const open = (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  return (
    <View className="w-full bg-carbon-black px-5 pb-10 pt-12">
      <View className="mx-auto w-full max-w-5xl">
        <View className="flex-row flex-wrap items-center gap-4">
          {SOCIALS.map((s) => (
            <Pressable
              key={s.label}
              onPress={() => open(s.url)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 8,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Ionicons name={s.icon} size={22} color="#c6c6c6" />
              <Text className="font-plex text-sm text-carbon-gray20">{s.label}</Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-8 border-t border-carbon-gray90 pt-6">
          <Text className="font-plex text-xs text-carbon-gray50">
            © 2026 BuildWise Labs. Diseñamos sistemas inteligentes que automatizan
            operaciones y hacen crecer negocios.
          </Text>
        </View>
      </View>
    </View>
  );
}
