import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import { api } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactScreen() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSent(false);
    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = 'Escribe tu nombre.';
    if (!EMAIL_RE.test(form.email)) next.email = 'Email no valido.';
    if (form.mensaje.trim().length < 10)
      next.mensaje = 'Cuentanos un poco mas (min. 10 caracteres).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.contact(form);
      setSent(true);
      setForm({ nombre: '', email: '', mensaje: '' });
    } catch (e) {
      setServerError(e.message || 'No se pudo enviar el mensaje.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="pb-8 pt-14">
        <Text className="font-plexlight text-4xl leading-10 text-carbon-black dark:text-white">
          Hablemos de tu proyecto
        </Text>
        <Text className="mt-4 max-w-xl font-plex text-lg leading-7 text-carbon-gray70 dark:text-carbon-gray20">
          Completa el formulario y nuestro equipo te contactara.
        </Text>
      </View>

      <View className="mb-16 max-w-xl">
        <Field
          label="Nombre"
          value={form.nombre}
          onChangeText={set('nombre')}
          placeholder="Tu nombre"
          error={errors.nombre}
        />
        <Field
          label="Correo electronico corporativo"
          value={form.email}
          onChangeText={set('email')}
          placeholder="tucorreo@empresa.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Mensaje"
          value={form.mensaje}
          onChangeText={set('mensaje')}
          placeholder="Describe brevemente tu necesidad..."
          error={errors.mensaje}
          multiline
        />

        {serverError ? (
          <View className="mt-6 flex-row items-center gap-2 border-l-4 border-carbon-red bg-carbon-gray10 dark:bg-carbon-gray90 px-4 py-3">
            <Ionicons name="alert-circle" size={18} color="#da1e28" />
            <Text className="flex-1 font-plex text-sm text-carbon-red">
              {serverError}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View className="mt-8 h-11 w-40 items-center justify-center bg-carbon-blue">
            <ActivityIndicator color="#ffffff" />
          </View>
        ) : (
          <Button label="Enviar" className="mt-8 self-start" onPress={onSubmit} />
        )}

        {sent ? (
          <View className="mt-6 flex-row items-center gap-2 border-l-4 border-carbon-green bg-carbon-gray10 dark:bg-carbon-gray90 px-4 py-3">
            <Ionicons name="checkmark-circle" size={20} color="#24a148" />
            <Text className="font-plex text-sm text-carbon-black dark:text-white">
              Mensaje enviado. Te contactaremos pronto.
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

/** Campo de formulario estilo Carbon: label arriba, fondo gray10, borde inferior. */
function Field({ label, error, multiline, ...props }) {
  return (
    <View className="mb-6">
      <Text className="mb-2 font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">{label}</Text>
      <TextInput
        placeholderTextColor="#8d8d8d"
        multiline={multiline}
        className={`bg-carbon-gray10 dark:bg-carbon-gray90 px-4 font-plex text-base text-carbon-black dark:text-white ${
          multiline ? 'h-28 py-3' : 'h-11'
        } border-b ${error ? 'border-carbon-red' : 'border-carbon-gray50'}`}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
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
