import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#c026d3', '#2f6bf5', '#7c3aed', '#161616', '#24a148'];

export default function ProfileSettingsScreen({ navigation }) {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [color, setColor] = useState(user?.avatarColor || '#c026d3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated) {
    return (
      <Screen>
        <View className="items-center py-24">
          <Ionicons name="lock-closed-outline" size={40} color="#525252" />
          <Text className="mt-4 font-plexsemibold text-xl text-carbon-black dark:text-white">
            Necesitas iniciar sesion
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

  const initials = (name || user.email || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const onSave = async () => {
    setError('');
    setSaved(false);
    if (!name.trim()) {
      setError('El nombre no puede estar vacio.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        photo: photo.trim() || null,
        avatarColor: color,
      });
      setSaved(true);
    } catch (e) {
      setError(e.message || 'No se pudo guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="max-w-xl py-14">
        <Text className="font-plexlight text-4xl leading-10 text-carbon-black dark:text-white">
          Configurar perfil
        </Text>
        <Text className="mt-4 font-plex text-lg leading-7 text-carbon-gray70 dark:text-carbon-gray20">
          Actualiza tu nombre y tu foto.
        </Text>

        {/* Vista previa del avatar */}
        <View className="mt-8 flex-row items-center gap-4">
          <Avatar initials={initials} photo={photo.trim() || null} bg={color} size={72} />
          <View className="flex-1">
            <Text className="font-plexsemibold text-lg text-carbon-black dark:text-white">
              {name || 'Tu nombre'}
            </Text>
            <Text className="font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
              {user.email}
            </Text>
          </View>
        </View>

        {/* Nombre */}
        <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />

        {/* Foto por URL */}
        <Field
          label="URL de la foto (opcional)"
          value={photo}
          onChangeText={setPhoto}
          placeholder="https://.../foto.jpg"
          autoCapitalize="none"
        />
        {photo.trim() ? (
          <Pressable className="mt-2 flex-row items-center gap-1" onPress={() => setPhoto('')}>
            <Ionicons name="trash-outline" size={16} color="#da1e28" />
            <Text className="font-plex text-sm text-carbon-red">Quitar foto</Text>
          </Pressable>
        ) : null}

        {/* Color del avatar (si no hay foto) */}
        <Text className="mb-2 mt-6 font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">
          Color del avatar (cuando no hay foto)
        </Text>
        <View className="flex-row gap-3">
          {COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              style={{ backgroundColor: c, width: 36, height: 36 }}
              className={`items-center justify-center ${
                color === c ? 'border-2 border-carbon-black dark:border-white' : ''
              }`}
            >
              {color === c ? (
                <Ionicons name="checkmark" size={18} color="#ffffff" />
              ) : null}
            </Pressable>
          ))}
        </View>

        {error ? (
          <View className="mt-6 flex-row items-center gap-2 border-l-4 border-carbon-red bg-carbon-gray10 dark:bg-carbon-gray90 px-4 py-3">
            <Ionicons name="alert-circle" size={18} color="#da1e28" />
            <Text className="flex-1 font-plex text-sm text-carbon-red">{error}</Text>
          </View>
        ) : null}

        {saved ? (
          <View className="mt-6 flex-row items-center gap-2 border-l-4 border-carbon-green bg-carbon-gray10 dark:bg-carbon-gray90 px-4 py-3">
            <Ionicons name="checkmark-circle" size={20} color="#24a148" />
            <Text className="font-plex text-sm text-carbon-black dark:text-white">
              Perfil actualizado.
            </Text>
          </View>
        ) : null}

        <View className="mt-8 flex-row flex-wrap gap-3">
          {loading ? (
            <View className="h-11 w-40 items-center justify-center bg-carbon-blue">
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <Button label="Guardar cambios" onPress={onSave} />
          )}
          <Button
            label="Volver al perfil"
            variant="tertiary"
            icon="arrow-back"
            onPress={() => navigation.navigate('Perfil')}
          />
        </View>
      </View>
    </Screen>
  );
}

function Field({ label, ...props }) {
  return (
    <View className="mt-6">
      <Text className="mb-2 font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">
        {label}
      </Text>
      <TextInput
        placeholderTextColor="#8d8d8d"
        className="h-11 bg-carbon-gray10 dark:bg-carbon-gray90 px-4 font-plex text-base text-carbon-black dark:text-white border-b border-carbon-gray50"
        {...props}
      />
    </View>
  );
}
