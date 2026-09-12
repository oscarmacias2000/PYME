import { View, Text, Pressable, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Photo from '../components/ui/Photo';
import CarbonTile from '../components/CarbonTile';
import HeroSpace from '../components/HeroSpace';
import TestimonialsSection from '../components/TestimonialsSection';
import ToolsGrid from '../components/ToolsGrid';
import LikeSection from '../components/LikeSection';
import { SERVICES, RECOMMENDED, PRODUCTS, CASES } from '../constants/services';
import { IMAGES } from '../constants/images';

export default function HomeScreen({ navigation }) {
  const { colorScheme } = useColorScheme();
  const arrow = colorScheme === 'dark' ? '#f4f4f4' : '#161616';
  return (
    <Screen
      hero={(scrollY) => (
        <HeroSpace scrollY={scrollY} navigation={navigation} />
      )}
      prefooter={<TechStack />}
    >
      {/* RECOMENDADO */}
      <View className="pt-12" />
      <SectionTitle>Recomendado para ti</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {RECOMMENDED.map((r) => (
          <Pressable
            key={r.id}
            className="min-w-[220px] flex-1 bg-white dark:bg-carbon-black p-5 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
          >
            <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
              {r.tag}
            </Text>
            <Text className="mt-3 min-h-[72px] font-plex text-base leading-6 text-carbon-black dark:text-white">
              {r.title}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={arrow} />
          </Pressable>
        ))}
      </View>

      {/* SERVICIOS (tiles) */}
      <SectionTitle>Nuestros servicios</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {SERVICES.map((s) => (
          <View key={s.id} className="min-w-[260px] flex-1 basis-[45%]">
            <CarbonTile
              service={s}
              onPress={() => navigation.navigate('Servicio', { id: s.id })}
            />
          </View>
        ))}
      </View>

      {/* TEASER NOSOTROS con foto */}
      <View className="mb-16 flex-row flex-wrap items-center gap-8 bg-carbon-gray10 dark:bg-carbon-gray90 p-8">
        <View className="min-w-[280px] flex-1">
          <Photo uri={IMAGES.aboutMeeting} height={260} />
        </View>
        <View className="min-w-[280px] flex-1">
          <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
            Un equipo cercano y tecnico
          </Text>
          <Text className="mt-3 max-w-md font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
            Somos el equipo detras de BuildWise Labs: desarrolladores, especialistas
            en automatizacion y seguridad que acompanan cada proyecto de
            principio a fin.
          </Text>
          <Button
            label="Sobre nosotros"
            variant="tertiary"
            className="mt-6 self-start"
            onPress={() => navigation.navigate('Nosotros')}
          />
        </View>
      </View>

      {/* PRODUCTOS */}
      <SectionTitle>Tecnologia de vanguardia para tu negocio</SectionTitle>
      <View className="mb-16 flex-row flex-wrap gap-3">
        {PRODUCTS.map((p) => (
          <View
            key={p}
            className="border border-carbon-gray20 dark:border-carbon-gray90 px-4 py-3 hover:border-carbon-blue"
          >
            <Text className="font-plex text-base text-carbon-black dark:text-white">{p}</Text>
          </View>
        ))}
      </View>

      {/* CASOS / METRICAS */}
      <View className="mb-16 bg-carbon-gray10 dark:bg-carbon-gray90 p-8">
        <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
          Impacto medible
        </Text>
        <View className="mt-8 flex-row flex-wrap gap-y-8">
          {CASES.map((c) => (
            <View key={c.id} className="min-w-[200px] flex-1 pr-4">
              <Text className="font-plexlight text-5xl text-carbon-electric">
                {c.metric}
              </Text>
              <Text className="mt-3 max-w-[200px] font-plex text-sm leading-5 text-carbon-gray70 dark:text-carbon-gray20">
                {c.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* HERRAMIENTAS */}
      <ToolsGrid />

      {/* TESTIMONIOS */}
      <TestimonialsSection />

      {/* LIKES */}
      <LikeSection />

      {/* CTA FINAL */}
      <View className="mb-16 flex-row flex-wrap items-center justify-between gap-4 bg-carbon-black p-8">
        <Text className="max-w-[420px] font-plexlight text-2xl leading-8 text-white">
          Empecemos a construir la proxima etapa de tu empresa
        </Text>
        <Button
          label="Contactar"
          onPress={() => navigation.navigate('Contacto')}
        />
      </View>
    </Screen>
  );
}

function SectionTitle({ children }) {
  return (
    <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
      {children}
    </Text>
  );
}

// ── Tech stack subfooter ────────────────────────────────────────────────────
const _BLUE = '#4589ff';
const _TECH = [
  {
    name: 'React',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348"><circle cx="0" cy="0" r="2.05" fill="${_BLUE}"/><g fill="none" stroke="${_BLUE}" stroke-width="1"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></svg>`,
  },
  {
    name: 'Expo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60"><text x="90" y="42" text-anchor="middle" font-size="36" font-weight="900" font-family="sans-serif" fill="${_BLUE}" letter-spacing="-1">expo</text></svg>`,
  },
  {
    name: 'Express',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60"><text x="110" y="42" text-anchor="middle" font-size="28" font-weight="700" font-family="sans-serif" fill="${_BLUE}">Express</text></svg>`,
  },
  {
    name: 'Tailwind',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 33"><path fill="${_BLUE}" fill-rule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 12.672 33.808 15.98 40.5 15.98c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C37.256 3.308 34.192 0 27 0zM13.5 15.98C6.3 15.98 1.8 19.58 0 26.78c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C16.744 28.652 19.808 31.96 26.5 31.96c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.003-5.147-3.653C23.756 19.288 20.692 15.98 13.5 15.98z" clip-rule="evenodd"/></svg>`,
  },
  {
    name: 'Nginx',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><text x="60" y="40" text-anchor="middle" font-size="26" font-weight="700" font-family="sans-serif" fill="${_BLUE}" letter-spacing="1">nginx</text></svg>`,
  },
  {
    name: 'Hostinger',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><text x="100" y="40" text-anchor="middle" font-size="22" font-weight="700" font-family="sans-serif" fill="${_BLUE}">Hostinger</text></svg>`,
  },
  {
    name: 'Vercel',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60"><polygon points="80,8 140,52 20,52" fill="${_BLUE}"/></svg>`,
  },
  {
    name: 'Facebook',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  },
  {
    name: 'Instagram',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  },
  {
    name: 'TikTok',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  },
  {
    name: 'X',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    name: 'YouTube',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    name: 'LinkedIn',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${_BLUE}" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
];

function TechStack() {
  return (
    <View style={{ backgroundColor: '#161616', paddingVertical: 36, borderTopWidth: 1, borderTopColor: '#262626' }}>
      <Text style={{ color: '#525252', fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 3, marginBottom: 28, textTransform: 'uppercase' }}>
        Construido con
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 32, gap: 40, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}
      >
        {_TECH.map((t) => (
          <View key={t.name} style={{ alignItems: 'center', gap: 8 }}>
            <Image
              source={{ uri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.svg)}` }}
              style={{ width: 52, height: 32, opacity: 0.75 }}
              resizeMode="contain"
            />
            <Text style={{ color: '#8d8d8d', fontSize: 10, letterSpacing: 1 }}>{t.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

