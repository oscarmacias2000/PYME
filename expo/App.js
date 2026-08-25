import './global.css';

import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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

// URLs limpias en web.
const linking = {
  prefixes: [],
  config: {
    screens: {
      Inicio: '',
      Servicios: 'servicios',
      Servicio: 'servicios/:id',
      Docs: 'docs',
      Nosotros: 'nosotros',
      Contacto: 'contacto',
      Login: 'login',
      Perfil: 'perfil',
      PerfilConfig: 'perfil/configurar',
    },
  },
};

// Tema de navegacion: fondo blanco (Carbon usa blanco puro).
const navTheme = {
  dark: false,
  colors: {
    primary: '#c026d3',
    background: '#ffffff',
    card: '#ffffff',
    text: '#161616',
    border: '#e0e0e0',
    notification: '#c026d3',
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
        <NavigationContainer linking={linking} theme={navTheme}>
          <RootNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
