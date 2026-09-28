import { View, Text, Pressable, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import ServiceSidebar from '../components/ServiceSidebar';
import ServiceArt from '../components/ServiceArt';
import ServiceDocPanel from '../components/ServiceDocPanel';
import GuideShowcase from '../components/GuideShowcase';
import TechStack from '../components/ui/TechStack';
import Starfield from '../components/ui/Starfield';
import { getService, SERVICES } from '../constants/services';
import { SERVICE_GALLERY } from '../constants/serviceGallery';
// URL pública del .exe — actualiza con la ruta real de tu servidor
const EXE_URL = 'https://buildwiselabs.net/downloads/VisorReportesCampo.exe';

export default function ServiceDetailScreen({ route, navigation }) {
  const id = route?.params?.id;
  const doc = route?.params?.doc; // pagina del sidebar abierta (?doc=slug)
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

  const wide = width >= 900;
  const gallery = SERVICE_GALLERY[service.id] || [];

  // Hero a todo el ancho: fondo espacial de marca, texto a la izquierda y la
  // ilustracion del servicio con el logotipo a la derecha.
  const hero = () => (
    <View className="w-full overflow-hidden bg-carbon-night" style={{ minHeight: 380 }}>
      <Starfield count={70} seed={service.id.length * 5} />
      <View className="mx-auto w-full max-w-5xl px-5 py-14">
        <Pressable
          className="flex-row items-center gap-1 self-start"
          onPress={() => navigation.navigate('Servicios')}
        >
          <Ionicons name="chevron-back" size={16} color="#c498c2" />
          <Text className="font-plex text-sm text-carbon-blue">Servicios</Text>
        </Pressable>

        <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 32 }}>
          <View style={{ flex: wide ? 1 : undefined }}>
            <View className="mt-6 flex-row items-center gap-3">
              <Ionicons name={service.icon} size={28} color="#c498c2" />
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
            <View className="mt-8 flex-row flex-wrap gap-3">
              <Button
                label="Solicitar este servicio"
                variant="pill"
                onPress={() => navigation.navigate('Contacto')}
              />
              {service.id === 'chatbot' && (
                <Button label="Probar chatbot" variant="pillDark" onPress={() => navigation.navigate('Chatbot')} />
              )}
              {service.id === 'visor-reportes' && (
                <Button label="Ver reportes" variant="pillDark" onPress={() => navigation.navigate('Reportes')} />
              )}
              {service.id === 'visor-reportes' && Platform.OS === 'web' && (
                <Button
                  label="Descargar para Windows (.exe)"
                  variant="pillDark"
                  icon="cloud-download-outline"
                  onPress={() => window.open(EXE_URL, '_blank')}
                />
              )}
            </View>
          </View>

          {/* Ilustracion del servicio con el logotipo */}
          <View
            className="overflow-hidden rounded-3xl border border-white/10"
            style={{ width: wide ? 420 : '100%', ...(Platform.OS === 'web' ? { boxShadow: '0 20px 60px rgba(157,107,153,0.18)' } : {}) }}
          >
            <ServiceArt service={service} height={wide ? 260 : 220} seed={3} />
          </View>
        </View>
      </View>
    </View>
  );

  // Debajo del contenido con sidebar: la guia a todo el ancho y luego los otros
  // servicios de vuelta en el ancho normal.
  const prefooter = (
    <>
      {service.guide && service.guide.length > 0 && (
        <GuideShowcase key={service.id} service={service} onContact={() => navigation.navigate('Contacto')} />
      )}
      <View className="mx-auto w-full max-w-5xl px-5 pt-16">
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
              <Ionicons name={s.icon} size={24} color="#9d6b99" />
              <Text className="mt-3 font-plexsemibold text-base text-carbon-black dark:text-white">
                {s.title}
              </Text>
              <Text className="mt-1 font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
                {s.tagline}
              </Text>
              <View className="mt-3 flex-row items-center gap-1">
                <Text className="font-plex text-sm text-carbon-blue">Ver</Text>
                <Ionicons name="arrow-forward" size={16} color="#9d6b99" />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <Screen hero={hero} prefooter={prefooter}>
      <View className="flex-row flex-wrap gap-8 pt-10">
        {/* Sidebar desplegable */}
        <ServiceSidebar currentId={service.id} activeDoc={doc} navigation={navigation} />

        {/* Contenido principal */}
        <View className="min-w-[300px] flex-1">
      {/* Pagina de documentacion elegida en el sidebar (Postgres) */}
      {doc ? (
        <ServiceDocPanel
          serviceId={service.id}
          slug={doc}
          onClose={() => navigation.setParams({ doc: undefined })}
        />
      ) : null}

      {/* En accion: escenas de marca del servicio */}
      {gallery.length > 0 && (
        <View className="mb-16">
          <Text className="mb-6 font-plexsemibold text-2xl text-carbon-black dark:text-white">
            En acción
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 4 }}
          >
            {gallery.map((g, i) => (
              <View
                key={g.caption}
                className="overflow-hidden rounded-xl border border-carbon-gray20 bg-white dark:border-carbon-gray90 dark:bg-carbon-black"
                style={{ width: 300 }}
              >
                <ServiceArt service={service} scene={g.scene} height={170} seed={i + 5} label={g.caption} />
                <View className="flex-row items-center gap-2 px-4 pt-3">
                  <View className="h-1.5 w-1.5 rounded-full bg-carbon-blue" />
                  <Text className="flex-1 font-plex text-sm text-carbon-black dark:text-white">{g.caption}</Text>
                </View>
                <View className="px-4 pb-4 pt-3">
                  <TechStack items={g.stack} />
                </View>
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
            <Ionicons name={f.icon} size={28} color="#9d6b99" />
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
        </View>
      </View>
    </Screen>
  );
}
