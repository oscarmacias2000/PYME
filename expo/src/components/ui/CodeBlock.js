import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={{ borderWidth: 1, borderColor: '#393939', overflow: 'hidden' }}>
      {/* Barra superior */}
      <View style={{ backgroundColor: '#262626', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ fontFamily: 'monospace', fontSize: 11, color: '#8d8d8d', textTransform: 'uppercase', letterSpacing: 1 }}>
          {lang || 'code'}
        </Text>
        <Pressable onPress={copy} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons
            name={copied ? 'checkmark-outline' : 'copy-outline'}
            size={14}
            color={copied ? '#24a148' : '#8d8d8d'}
          />
          <Text style={{ fontSize: 12, color: copied ? '#24a148' : '#8d8d8d' }}>
            {copied ? 'Copiado' : 'Copiar'}
          </Text>
        </Pressable>
      </View>

      {/* Codigo */}
      <ScrollView
        style={{ maxHeight: 320, backgroundColor: '#161616' }}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} nestedScrollEnabled>
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            <Text
              selectable
              style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 22, color: '#e0e0e0' }}
            >
              {code}
            </Text>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}
