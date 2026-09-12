import { View, Text, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const API = 'https://buildwiselabs.net';

export default function LikeSection() {
  const [likes, setLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/likes`)
      .then(r => r.json())
      .then(d => setLikes(d.likes))
      .catch(() => {});
  }, []);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/likes`, { method: 'POST' });
      const d = await r.json();
      setLikes(d.likes);
      setLiked(true);
    } catch {}
    setLoading(false);
  }

  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: 48,
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    }}>
      <Text style={{ fontSize: 20, fontWeight: '300', color: '#161616' }}
        className="dark:text-white">
        ¿Te gusta lo que hacemos?
      </Text>

      <Pressable
        onPress={handleLike}
        disabled={liked || loading}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: liked ? '#d1fae5' : pressed ? '#e8f5e9' : '#ffffff',
          borderWidth: 2,
          borderColor: liked ? '#24a148' : '#0f62fe',
          borderRadius: 40,
          paddingHorizontal: 28,
          paddingVertical: 14,
          shadowColor: liked ? '#24a148' : '#0f62fe',
          shadowOpacity: liked ? 0.2 : 0.1,
          shadowRadius: 12,
          elevation: liked ? 4 : 2,
        })}
      >
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={24}
          color={liked ? '#24a148' : '#0f62fe'}
        />
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: liked ? '#24a148' : '#0f62fe',
        }}>
          {liked ? '¡Gracias!' : 'Me gusta esta página'}
        </Text>
      </Pressable>

      {likes !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="heart" size={14} color="#f4595b" />
          <Text style={{ fontSize: 13, color: '#525252' }}
            className="dark:text-carbon-gray20">
            {likes.toLocaleString('es-MX')} {likes === 1 ? 'persona le' : 'personas les'} gusta esto
          </Text>
        </View>
      )}
    </View>
  );
}
