import { Animated, View, Text, Image } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import Button from './ui/Button';
import { IMAGES, HERO_VIDEO } from '../constants/images';

const H = 620; // alto del hero

/**
 * Hero a todo el ancho con un video ambiente de fondo (loop, silenciado),
 * con la foto de la Tierra como poster/fallback. Al hacer scroll el fondo se
 * desvanece (se oculta) con parallax; al volver a subir reaparece.
 */
export default function HeroSpace({ scrollY, navigation }) {
  // Reproductor: en bucle, silenciado y en reproduccion automatica.
  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // El fondo se oculta conforme avanza el scroll.
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.75],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // Parallax: el fondo se mueve mas lento que el contenido.
  const bgTranslate = scrollY.interpolate({
    inputRange: [0, H],
    outputRange: [0, 160],
    extrapolate: 'clamp',
  });
  // El texto tambien se atenua un poco al bajar.
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ height: H }} className="w-full justify-center overflow-hidden bg-carbon-black">
      {/* Fondo animado: poster (imagen) + video encima */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: bgOpacity,
          transform: [{ translateY: bgTranslate }],
        }}
      >
        {/* Poster / fallback mientras carga el video */}
        <Image
          source={{ uri: IMAGES.space }}
          resizeMode="cover"
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        {/* Video ambiente */}
        <VideoView
          player={player}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
      </Animated.View>

      {/* Velo para legibilidad del texto */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Contenido */}
      <Animated.View
        style={{ opacity: contentOpacity }}
        className="mx-auto w-full max-w-5xl px-5"
      >
        <Text className="font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-blue">
          BuildWise Labs
        </Text>
        <Text className="mt-4 max-w-3xl font-plexlight text-5xl leading-[56px] text-white">
          Diseñamos sistemas inteligentes que automatizan operaciones y hacen
          crecer negocios
        </Text>
        <Text className="mt-5 max-w-xl font-plex text-lg leading-7 text-carbon-gray20">
          Automatizamos tu negocio con IA y tecnología para que puedas hacer más
          con menos trabajo manual.
        </Text>
        <View className="mt-8 flex-row flex-wrap gap-4">
          <Button
            label="Explora los servicios"
            onPress={() => navigation.navigate('Servicios')}
          />
          <Button
            label="Conoce al equipo"
            variant="outlineWhite"
            icon={null}
            onPress={() => navigation.navigate('Nosotros')}
          />
        </View>
      </Animated.View>
    </View>
  );
}
