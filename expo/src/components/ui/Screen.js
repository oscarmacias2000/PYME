import { useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import NavBar from '../NavBar';
import Footer from '../Footer';

/**
 * Layout base estilo IBM: barra superior fija, contenido con scroll y footer.
 * @param {(scrollY: Animated.Value) => React.ReactNode} [hero]
 *   Bloque a todo el ancho renderizado antes del contenido; recibe el
 *   desplazamiento vertical para animarse con el scroll.
 */
export default function Screen({ children, hero }) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View className="flex-1 bg-white dark:bg-carbon-black" style={{ paddingTop: insets.top }}>
      <NavBar />
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {hero ? hero(scrollY) : null}
        <View className="mx-auto w-full max-w-5xl px-5">{children}</View>
        <Footer />
      </Animated.ScrollView>
    </View>
  );
}
