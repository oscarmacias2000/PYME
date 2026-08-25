import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (isRegister && !form.name.trim()) next.name = 'Escribe tu nombre.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Email no valido.';
    if (form.password.length < 4) next.password = 'Minimo 4 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigation.navigate('Perfil');
    } catch (e) {
      setServerError(e.message || 'Ocurrio un error.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setErrors({});
    setServerError('');
  };

  return (
    <Screen>
      <View className="items-center py-16">
        <View className="w-full max-w-sm border border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black p-8">
          <Text className="font-plexsemibold text-xs uppercase tracking-wide text-carbon-blue">
            BuildWise Labs
          </Text>
          <Text className="mt-2 font-plexlight text-3xl text-carbon-black dark:text-white">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
          </Text>
          <Text className="mt-2 font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
            {isRegister
              ? 'Registrate para acceder a tu panel.'
              : 'Accede a tu panel de BuildWise Labs.'}
          </Text>

          {isRegister ? (
            <Field
              label="Nombre"
              value={form.name}
              onChangeText={set('name')}
              placeholder="Tu nombre"
              error={errors.name}
            />
          ) : null}

          <Field
            label="Correo electronico"
            value={form.email}
            onChangeText={set('email')}
            placeholder="tucorreo@empresa.com"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Contrasena"
            value={form.password}
            onChangeText={set('password')}
            placeholder="********"
            error={errors.password}
            secureTextEntry
          />

          {serverError ? (
            <View className="mt-4 flex-row items-center gap-2 border-l-4 border-carbon-red bg-carbon-gray10 dark:bg-carbon-gray90 px-3 py-2">
              <Ionicons name="alert-circle" size={16} color="#da1e28" />
              <Text className="flex-1 font-plex text-xs text-carbon-red">
                {serverError}
              </Text>
            </View>
          ) : null}

          {loading ? (
            <View className="mt-6 h-11 items-center justify-center bg-carbon-blue">
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <Button
              label={isRegister ? 'Crear cuenta' : 'Continuar'}
              className="mt-6 w-full"
              onPress={onSubmit}
            />
          )}

          <View className="mt-6 flex-row justify-center gap-1">
            <Text className="font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
              {isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}
            </Text>
            <Pressable onPress={switchMode}>
              <Text className="font-plexsemibold text-sm text-carbon-blue">
                {isRegister ? 'Inicia sesion' : 'Crear cuenta'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

function Field({ label, error, ...props }) {
  return (
    <View className="mt-6">
      <Text className="mb-2 font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">{label}</Text>
      <TextInput
        placeholderTextColor="#8d8d8d"
        className={`h-11 bg-carbon-gray10 dark:bg-carbon-gray90 px-4 font-plex text-base text-carbon-black dark:text-white border-b ${
          error ? 'border-carbon-red' : 'border-carbon-gray50'
        }`}
        {...props}
      />
      {error ? (
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons name="warning" size={14} color="#da1e28" />
          <Text className="font-plex text-xs text-carbon-red">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
