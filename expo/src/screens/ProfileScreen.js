import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  // Ruta protegida: si no hay sesion, invita a iniciar sesion.
  if (!isAuthenticated) {
    return (
      <Screen>
        <View className="items-center py-24">
          <Ionicons name="lock-closed-outline" size={40} color="#525252" />
          <Text className="mt-4 font-plexsemibold text-xl text-carbon-black dark:text-white">
            Necesitas iniciar sesion
          </Text>
          <Text className="mt-2 font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
            Accede para ver tu perfil.
          </Text>
          <Button
            label="Iniciar sesion"
            className="mt-6"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="py-14">
        {/* Cabecera de perfil */}
        <View className="flex-row items-center gap-4 border-b border-carbon-gray20 dark:border-carbon-gray90 pb-8">
          <Avatar
            initials={user.initials}
            photo={user.photo}
            bg={user.avatarColor || undefined}
            size={64}
          />
          <View>
            <Text className="font-plexsemibold text-2xl text-carbon-black dark:text-white">
              {user.name}
            </Text>
            <Text className="mt-1 font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
              {user.email}
            </Text>
          </View>
        </View>

        {/* Detalle */}
        <View className="mt-8 max-w-xl">
          <Row label="Nombre" value={user.name} />
          <Row label="Correo" value={user.email} />
          <Row label="Plan" value="BuildWise Starter" />
          <Row label="Estado" value="Activo" />
        </View>

        <View className="mt-10 flex-row flex-wrap gap-3">
          <Button
            label="Configurar perfil"
            icon="settings-outline"
            onPress={() => navigation.navigate('PerfilConfig')}
          />
          <Button
            label="Cerrar sesion"
            variant="tertiary"
            icon="log-out-outline"
            onPress={() => {
              logout();
              navigation.navigate('Inicio');
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

function Row({ label, value }) {
  return (
    <View className="flex-row justify-between border-b border-carbon-gray20 dark:border-carbon-gray90 py-4">
      <Text className="font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">{label}</Text>
      <Text className="font-plexsemibold text-sm text-carbon-black dark:text-white">
        {value}
      </Text>
    </View>
  );
}
