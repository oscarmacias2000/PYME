import { Platform, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Screen from '../components/ui/Screen';

// Cambia esta URL por la de tu servidor cuando lo despliegues
const CHATBOT_URL = 'https://chat.buildwiselabs.duckdns.org';

function ChatbotWeb({ navigation }) {
  return (
    <Screen>
      <View className="flex-1 overflow-hidden rounded-none" style={{ minHeight: 600 }}>
        <View className="flex-row items-center gap-3 border-b border-carbon-gray20 dark:border-carbon-gray90 px-5 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#c026d3" />
          </Pressable>
          <Ionicons name="chatbubbles-outline" size={22} color="#c026d3" />
          <Text className="font-plexsemibold text-lg text-carbon-black dark:text-white">
            Chatbot BuildWise
          </Text>
        </View>
        {/* iframe para la versión web */}
        <iframe
          src={CHATBOT_URL}
          title="Chatbot BuildWise"
          style={{ flex: 1, border: 'none', width: '100%', minHeight: 560 }}
          allow="microphone"
        />
      </View>
    </Screen>
  );
}

function ChatbotNative({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View className="flex-1 bg-white dark:bg-carbon-black">
      {/* Header */}
      <View
        className="flex-row items-center gap-3 border-b border-carbon-gray20 dark:border-carbon-gray90 px-4 py-3"
        style={{ paddingTop: 48 }}
      >
        <Pressable onPress={() => navigation.goBack()} className="p-1">
          <Ionicons name="chevron-back" size={24} color="#c026d3" />
        </Pressable>
        <Ionicons name="chatbubbles-outline" size={22} color="#c026d3" />
        <Text className="flex-1 font-plexsemibold text-base text-carbon-black dark:text-white">
          Chatbot BuildWise
        </Text>
        {loading && <ActivityIndicator size="small" color="#c026d3" />}
      </View>

      {error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#525252" />
          <Text className="font-plexsemibold text-xl text-carbon-black dark:text-white text-center">
            Sin conexión
          </Text>
          <Text className="font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20 text-center">
            No se pudo conectar al chatbot. Verifica tu conexión o intenta más tarde.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: CHATBOT_URL }}
          style={{ flex: 1 }}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          // Permite el micrófono para voz
          mediaCapturePermissionGrantType="grant"
        />
      )}
    </View>
  );
}

export default function ChatbotScreen({ navigation }) {
  if (Platform.OS === 'web') return <ChatbotWeb navigation={navigation} />;
  return <ChatbotNative navigation={navigation} />;
}
