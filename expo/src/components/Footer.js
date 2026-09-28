import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import BuildWiseLogo from './BuildWiseLogo';
import { SERVICES } from '../constants/services';

const SOCIALS = [
  { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/buildwiselabs' },
  { icon: 'logo-linkedin',  label: 'LinkedIn',  url: 'https://linkedin.com/company/buildwiselabs' },
  { icon: 'logo-github',    label: 'GitHub',    url: 'https://github.com/buildwiselabs' },
  { icon: 'logo-whatsapp', label: 'WhatsApp',  url: 'https://wa.me/521XXXXXXXXXX' },
];

const COMPANY = [
  { label: 'Documentacion', route: 'Docs' },
  { label: 'Contacto', route: 'Contacto' },
  { label: 'Iniciar sesion', route: 'Login' },
];

export default function Footer() {
  const navigation = useNavigation();
  const open = (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  return (
    <View className="w-full bg-carbon-black px-5 pb-10 pt-14">
      <View className="mx-auto w-full max-w-5xl">
        <View className="flex-row flex-wrap gap-y-10">
          {/* Marca */}
          <View className="min-w-[260px] flex-[1.4] pr-8">
            <BuildWiseLogo height={28} variant="light" />
            <Text className="mt-4 max-w-xs font-plex text-sm leading-6 text-carbon-gray50">
              Diseñamos sistemas inteligentes que automatizan operaciones y
              hacen crecer negocios.
            </Text>
            <View className="mt-6 flex-row gap-2">
              {SOCIALS.map((s) => (
                <Pressable
                  key={s.label}
                  onPress={() => open(s.url)}
                  accessibilityLabel={s.label}
                  className="h-10 w-10 items-center justify-center border border-carbon-gray90 hover:border-carbon-blue hover:bg-carbon-gray90"
                >
                  <Ionicons name={s.icon} size={18} color="#c6c6c6" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Servicios */}
          <FooterColumn title="Servicios">
            {SERVICES.slice(0, 6).map((s) => (
              <FooterLink
                key={s.id}
                label={s.title}
                onPress={() => navigation.navigate('Servicio', { id: s.id })}
              />
            ))}
          </FooterColumn>

          {/* Empresa */}
          <FooterColumn title="Empresa">
            {COMPANY.map((c) => (
              <FooterLink
                key={c.route}
                label={c.label}
                onPress={() => navigation.navigate(c.route)}
              />
            ))}
          </FooterColumn>
        </View>

        <View className="mt-12 flex-row flex-wrap items-center justify-between gap-3 border-t border-carbon-gray90 pt-6">
          <Text className="font-plex text-xs text-carbon-gray50">
            © 2026 BuildWise Labs. Todos los derechos reservados.
          </Text>
          <Text className="font-plex text-xs text-carbon-gray50">
            Hecho en México
          </Text>
        </View>
      </View>
    </View>
  );
}

function FooterColumn({ title, children }) {
  return (
    <View className="min-w-[180px] flex-1">
      <Text className="mb-4 font-plexsemibold text-xs uppercase tracking-[2px] text-white">
        {title}
      </Text>
      <View className="gap-3">{children}</View>
    </View>
  );
}

function FooterLink({ label, onPress }) {
  return (
    <Pressable onPress={onPress} className="self-start">
      <Text className="font-plex text-sm text-carbon-gray50 hover:text-white">
        {label}
      </Text>
    </Pressable>
  );
}
