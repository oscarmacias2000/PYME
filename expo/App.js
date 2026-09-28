import './global.css';

import { StatusBar } from 'expo-status-bar';
import { Animated, View } from 'react-native';
import { cssInterop } from 'nativewind';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  IBMPlexSans_300Light,
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import MiniBot from './src/components/MiniBot';

// Ref de navegacion para componentes fuera del stack (mini bot flotante).
const navigationRef = createNavigationContainerRef();

// NativeWind no aplica className a Animated.View por defecto: se registra aqui
// para que los paneles animados (mini bot, FAQ, proceso) reciban sus estilos.
cssInterop(Animated.View, { className: 'style' });

// URLs limpias en web.
const linking = {
  prefixes: [],
  config: {
    screens: {
      Inicio: '',
      Servicios: 'servicios',
      Servicio: 'servicios/:id',
      Docs: 'docs',
      Documento: 'docs/:id',
      Contacto: 'contacto',
      Login: 'login',
      Perfil: 'perfil',
      PerfilConfig: 'perfil/configurar',
      Reportes: 'reportes',
    },
  },
};

// Tema de navegacion: fondo blanco (Carbon usa blanco puro).
const navTheme = {
  dark: false,
  colors: {
    primary: '#9d6b99',
    background: '#ffffff',
    card: '#ffffff',
    text: '#161616',
    border: '#e0e0e0',
    notification: '#9d6b99',
  },
  fonts: {
    regular: { fontFamily: 'IBMPlexSans_400Regular', fontWeight: '400' },
    medium: { fontFamily: 'IBMPlexSans_600SemiBold', fontWeight: '600' },
    bold: { fontFamily: 'IBMPlexSans_700Bold', fontWeight: '700' },
    heavy: { fontFamily: 'IBMPlexSans_700Bold', fontWeight: '700' },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    IBMPlexSans_300Light,
    IBMPlexSans_400Regular,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  if (!fontsLoaded) {
    return <View className="flex-1 bg-white dark:bg-carbon-black" />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef} linking={linking} theme={navTheme}>
          <RootNavigator />
          <MiniBot navigationRef={navigationRef} />
          <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
