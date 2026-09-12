import { Animated, View, Text, Image } from 'react-native';
import Button from './ui/Button';
import { IMAGES } from '../constants/images';

const H = 640;

export default function HeroSpace({ scrollY, navigation }) {
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.75],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const bgTranslate = scrollY.interpolate({
    inputRange: [0, H],
    outputRange: [0, 160],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, H * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ height: H }} className="w-full items-center justify-center overflow-hidden bg-carbon-black">
      {/* Fondo con parallax y overlay oscuro */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: bgOpacity,
          transform: [{ translateY: bgTranslate }],
        }}
      >
        <Image
          source={{ uri: IMAGES.space }}
          resizeMode="cover"
          style={{ width: '100%', height: '100%' }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        />
      </Animated.View>

      {/* Contenido centrado */}
      <Animated.View
        style={{ opacity: contentOpacity }}
        className="w-full max-w-4xl items-center px-6"
      >
        <Text className="font-plexsemibold text-xs uppercase tracking-[3px] text-carbon-blue">
          BuildWise Labs
        </Text>
        <Text className="mt-5 text-center font-plexbold text-4xl leading-tight text-white md:text-5xl lg:text-6xl">
          Diseñamos sistemas inteligentes que hacen crecer negocios
        </Text>
        <Text className="mt-6 max-w-2xl text-center font-plex text-base leading-7 text-carbon-gray20 md:text-xl">
          Automatizamos tu operación con IA y tecnología para que hagas más
          con menos trabajo manual.
        </Text>
        <View className="mt-10 flex-row flex-wrap justify-center gap-4">
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
