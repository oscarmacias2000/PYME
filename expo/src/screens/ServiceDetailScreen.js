import { View, Text, Pressable, Image, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// URL pública del .exe — actualiza con la ruta real de tu servidor
const EXE_URL = 'https://buildwiselabs.net/downloads/VisorReportesCampo.exe';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import CodeBlock from '../components/ui/CodeBlock';
import BrowserMockup from '../components/ui/BrowserMockup';
import InteractiveMockup from '../components/ui/InteractiveMockup';
import SvgIcon from '../components/ui/SvgIcon';
import NetworkTopology from '../components/ui/NetworkTopology';
import ServiceSidebar from '../components/ServiceSidebar';
import { getService, SERVICES } from '../constants/services';

export default function ServiceDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const service = getService(id);
  const { width } = useWindowDimensions();

  // Fallback si el id no existe.
  if (!service) {
    return (
      <Screen>
        <View className="items-center py-24">
          <Ionicons name="alert-circle-outline" size={40} color="#525252" />
          <Text className="mt-4 font-plexsemibold text-xl text-carbon-black dark:text-white">
            Servicio no encontrado
          </Text>
          <Button
            label="Ver todos los servicios"
            className="mt-6"
            onPress={() => navigation.navigate('Servicios')}
          />
        </View>
      </Screen>
    );
  }

  const others = SERVICES.filter((s) => s.id !== service.id);

  // Hero a todo el ancho (full-bleed) con la imagen del servicio de fondo.
  const hero = () => (
    <View className="w-full overflow-hidden bg-carbon-black" style={{ minHeight: 360 }}>
      <Image
        source={{ uri: service.image }}
        resizeMode="cover"
        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.7 }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      />
      <View className="mx-auto w-full max-w-5xl px-5 py-14">
        <Pressable
          className="flex-row items-center gap-1"
          onPress={() => navigation.navigate('Servicios')}
        >
          <Ionicons name="chevron-back" size={16} color="#e4b6f5" />
          <Text className="font-plex text-sm text-carbon-blue">Servicios</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <View style={{ flex: 1 }}>
            <View className="mt-6 flex-row items-center gap-3">
              <Ionicons name={service.icon} size={32} color="#ffffff" />
              <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
                {service.tagline}
              </Text>
            </View>
            <Text className="mt-3 max-w-3xl font-plexlight text-4xl leading-[46px] text-white">
              {service.title}
            </Text>
            <Text className="mt-4 max-w-2xl font-plex text-lg leading-7 text-carbon-gray20">
              {service.intro}
            </Text>
          </View>
          </View>
        <View className="mt-8 flex-row flex-wrap gap-3">
          <Button
            label="Solicitar este servicio"
            onPress={() => navigation.navigate('Contacto')}
          />
          {service.id === 'chatbot' && (
            <Button
              label="Probar chatbot →"
              onPress={() => navigation.navigate('Chatbot')}
            />
          )}
          {service.id === 'visor-reportes' && (
            <Button
              label="Ver reportes →"
              onPress={() => navigation.navigate('Reportes')}
            />
          )}
          {service.id === 'visor-reportes' && Platform.OS === 'web' && (
            <Pressable
              onPress={() => window.open(EXE_URL, '_blank')}
              className="flex-row items-center gap-2 border border-carbon-gray20 px-5 py-3"
            >
              <Ionicons name="cloud-download-outline" size={18} color="#161616" />
              <Text className="font-plexsemibold text-sm text-carbon-black dark:text-white">
                Descargar para Windows (.exe)
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Screen hero={hero}>
      <View className="flex-row flex-wrap gap-8 pt-10">
        {/* Sidebar desplegable */}
        <ServiceSidebar currentId={service.id} navigation={navigation} />

        {/* Contenido principal */}
        <View className="min-w-[300px] flex-1">
      {/* Galeria de fotos */}
      {service.gallery && service.gallery.length > 0 && (
        <View className="mb-16">
          <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
            En accion
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
          >
            {service.gallery.map((uri, i) => (
              <View
                key={i}
                style={{
                  width: 240, height: 160,
                  borderRadius: 8, overflow: 'hidden',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Features */}
      <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
        Que hacemos
      </Text>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {service.features.map((f) => (
          <View key={f.title} className="min-w-[220px] flex-1 bg-white dark:bg-carbon-black p-6">
            <Ionicons name={f.icon} size={28} color="#c026d3" />
            <Text className="mt-4 font-plexsemibold text-lg text-carbon-black dark:text-white">
              {f.title}
            </Text>
            <Text className="mt-2 font-plex text-sm leading-5 text-carbon-gray70 dark:text-carbon-gray20">
              {f.text}
            </Text>
          </View>
        ))}
      </View>

      {/* Que incluye */}
      <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
        Que incluye
      </Text>
      <View className="mb-16 border-t border-carbon-gray20 dark:border-carbon-gray90">
        {service.deliverables.map((d) => (
          <View
            key={d}
            className="flex-row items-center gap-3 border-b border-carbon-gray20 dark:border-carbon-gray90 py-4"
          >
            <Ionicons name="checkmark-circle" size={20} color="#24a148" />
            <Text className="font-plex text-base text-carbon-black dark:text-white">{d}</Text>
          </View>
        ))}
      </View>

      {/* Guia de inicio rapido */}
      {service.guide && service.guide.length > 0 && (
        <View className="mb-16">
          <Text className="mb-2 font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
            Documentacion
          </Text>
          <Text className="mb-8 font-plexlight text-3xl text-carbon-black dark:text-white">
            Guia de inicio rapido
          </Text>
          {service.guide.map((step) => (
            <View
              key={step.step}
              className="mb-8 border-l-4 border-carbon-gray20 dark:border-carbon-gray90 pl-5"
            >
              {/* Logo del paso */}
              {step.svgIcon && (
                <View style={{ marginBottom: 16 }}>
                  <SvgIcon svg={step.svgIcon} size={52} />
                </View>
              )}
              {/* Numero + titulo + badge */}
              <View className="flex-row flex-wrap items-center gap-3 mb-2">
                <View className="h-7 w-7 items-center justify-center bg-carbon-blue">
                  <Text className="font-plexbold text-xs text-white">{step.step}</Text>
                </View>
                <Text className="font-plexsemibold text-lg text-carbon-black dark:text-white flex-1">
                  {step.title}
                </Text>
                {step.badge && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: step.badge.color, paddingHorizontal: 10, paddingVertical: 4 }}>
                    {step.badge.logo && (
                      <Image source={{ uri: step.badge.logo }} style={{ width: 14, height: 14 }} resizeMode="contain" />
                    )}
                    <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 }}>
                      {step.badge.label}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="mb-3 font-plex text-sm leading-6 text-carbon-gray70 dark:text-carbon-gray20">
                {step.description}
              </Text>
              {step.topology ? (
                <>
                  <NetworkTopology
                    nodes={step.topology.nodes}
                    links={step.topology.links}
                    detail={step.topology.detail}
                    height={260}
                  ></NetworkTopology>
                  {step.code && <View style={{ marginTop: 8 }}><CodeBlock code={step.code} lang={step.lang} /></View>}
                </>
              ) : step.phoneMockup ? (
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <View style={{ flex: 1, minWidth: 260 }}>
                    <CodeBlock code={step.code} lang={step.lang} />
                  </View>
                  <InteractiveMockup screens={step.phoneMockup.screens} />
                </View>
              ) : (
                <>
                  <CodeBlock code={step.code} lang={step.lang} />
                  {step.mockup && (
                    <BrowserMockup
                      uri={step.mockup.uri}
                      url={step.mockup.url}
                      height={step.mockup.height || 320}
                    />
                  )}
                </>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Otros servicios */}
      <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
        Otros servicios
      </Text>
      <View className="mb-16 flex-row flex-wrap gap-px bg-carbon-gray20 dark:bg-carbon-gray90">
        {others.map((s) => (
          <Pressable
            key={s.id}
            className="min-w-[220px] flex-1 bg-white dark:bg-carbon-black p-5 hover:bg-carbon-gray10 dark:hover:bg-carbon-gray90"
            onPress={() => navigation.navigate('Servicio', { id: s.id })}
          >
            <Ionicons name={s.icon} size={24} color="#c026d3" />
            <Text className="mt-3 font-plexsemibold text-base text-carbon-black dark:text-white">
              {s.title}
            </Text>
            <Text className="mt-1 font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
              {s.tagline}
            </Text>
            <View className="mt-3 flex-row items-center gap-1">
              <Text className="font-plex text-sm text-carbon-blue">Ver</Text>
              <Ionicons name="arrow-forward" size={16} color="#c026d3" />
            </View>
          </Pressable>
        ))}
      </View>
        </View>
      </View>
    </Screen>
  );
}
