import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

import { reply, WELCOME } from '../../bot/miniBot';
import { CHATBOT_URL } from '../constants/chatbot';

const MARK = require('../../assets/buildwise-mark.png');
const WEB = Platform.OS === 'web';
const FIXED = WEB ? 'fixed' : 'absolute';
// Pantallas donde no se muestra (ya hay un chat a pantalla completa).
const HIDDEN_ON = ['Chatbot'];

let nextId = 1;
const msg = (from, data) => ({ id: nextId++, from, ...data });

/**
 * Mini bot flotante (esquina inferior derecha, en todas las pantallas).
 * - Panel pequeno: asistente rapido (motor en bot/miniBot.js) con botones que
 *   navegan a servicios, documentacion o contacto.
 * - Panel grande (boton "agrandar" o "Abrir chatbot completo"): la misma
 *   conversacion en grande y una pestana con el chatbot IA completo
 *   (OpenWebUI) incrustado, para chatear sin salir de la pagina.
 * @param navigationRef ref del NavigationContainer (se monta fuera del stack).
 */
export default function MiniBot({ navigationRef }) {
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false); // panel pequeno
  const [large, setLarge] = useState(false); // panel grande
  const [tab, setTab] = useState('quick'); // 'quick' | 'full'
  const [route, setRoute] = useState(null);
  const [messages, setMessages] = useState(() => [msg('bot', WELCOME)]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [hint, setHint] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const pop = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const expand = (t = 'quick') => {
    setTab(t);
    setOpen(false);
    setLarge(true);
  };
  const collapse = () => {
    setLarge(false);
    setOpen(true);
  };

  // Pantalla actual (para ocultarse en el chatbot completo).
  useEffect(() => {
    if (!navigationRef) return undefined;
    const update = () => setRoute(navigationRef.getCurrentRoute()?.name || null);
    update();
    return navigationRef.addListener('state', update);
  }, [navigationRef]);

  // Burbuja "¿Te ayudo?" una vez, a los pocos segundos.
  useEffect(() => {
    const show = setTimeout(() => setHint(true), 4000);
    const hide = setTimeout(() => setHint(false), 12000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Pulso suave del boton.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: false })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Apertura del panel pequeno.
  useEffect(() => {
    Animated.timing(pop, {
      toValue: open ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    if (open || large) setHint(false);
  }, [open, large, pop]);

  // Foco en la caja de texto al abrir cualquiera de los paneles.
  useEffect(() => {
    if ((open || (large && tab === 'quick')) && !typing) {
      const id = setTimeout(() => inputRef.current?.focus?.(), 250);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open, large, tab, typing]);

  // Escape: del panel grande vuelve al pequeno; del pequeno, cierra (web).
  useEffect(() => {
    if (!WEB || !(open || large)) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (large) collapse();
      else setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, large]);

  useEffect(() => {
    const id = setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 50);
    return () => clearTimeout(id);
  }, [messages, typing, large, tab]);

  const send = (value) => {
    const q = (value ?? text).trim();
    if (!q || typing) return;
    setText('');
    setMessages((m) => [...m, msg('user', { text: q })]);
    setTyping(true);
    // Pequena pausa para que se sienta natural.
    setTimeout(() => {
      setMessages((m) => [...m, msg('bot', reply(q))]);
      setTyping(false);
    }, 550 + Math.min(q.length * 12, 600));
  };

  const go = (a) => {
    if (a.open === 'full') {
      expand('full');
      return;
    }
    navigationRef?.navigate(a.route, a.params);
    if (large) collapse(); // deja ver la pagina y conserva el chat a mano
    if (width < 700) setOpen(false); // en celular el panel tapa la pagina
  };

  if (route && HIDDEN_ON.includes(route)) return null;

  const small = width < 480;
  const panelW = small ? width - 24 : 370;
  const panelH = Math.min(small ? height - 110 : 540, height - 110);

  // Conversacion (mensajes + caja de texto), en tamano normal o grande.
  const chat = (big) => (
    <>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          padding: big ? 24 : 14,
          gap: big ? 14 : 10,
          width: '100%',
          maxWidth: big ? 780 : undefined,
          alignSelf: 'center',
        }}
      >
        {messages.map((m, i) =>
          m.from === 'user' ? (
            <View
              key={m.id}
              className={`${big ? 'max-w-[70%] px-4 py-2.5' : 'max-w-[82%] px-3.5 py-2'} self-end rounded-2xl rounded-br-sm bg-carbon-blue`}
            >
              <Text className={`font-plex ${big ? 'text-base leading-6' : 'text-sm leading-5'} text-white`}>
                {m.text}
              </Text>
            </View>
          ) : (
            <View key={m.id} className={`${big ? 'max-w-[80%]' : 'max-w-[88%]'} flex-row items-end gap-2 self-start`}>
              <Image source={MARK} style={{ width: big ? 26 : 20, height: big ? 26 : 20, marginBottom: 2 }} resizeMode="contain" />
              <View className="flex-1 gap-2">
                <View className={`rounded-2xl rounded-bl-sm bg-white/[0.06] ${big ? 'px-4 py-3' : 'px-3.5 py-2'}`}>
                  <Text className={`font-plex ${big ? 'text-base leading-6' : 'text-sm leading-5'} text-carbon-gray20`}>
                    {m.text}
                  </Text>
                </View>
                {m.actions?.length ? (
                  <View className={big ? 'flex-row flex-wrap gap-2' : 'gap-1.5'}>
                    {m.actions.map((a) => (
                      <Pressable
                        key={a.label}
                        onPress={() => go(a)}
                        accessibilityRole={a.open ? 'button' : 'link'}
                        className={`flex-row items-center justify-between gap-2 rounded-xl border border-carbon-blue/50 px-3 py-2 hover:bg-carbon-blue/15 ${
                          big ? '' : 'w-full'
                        }`}
                      >
                        <Text className="flex-shrink font-plex text-[13px] text-white" numberOfLines={1}>
                          {a.label}
                        </Text>
                        <Ionicons name={a.open ? 'expand-outline' : 'arrow-forward'} size={14} color="#c498c2" />
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {/* Respuestas rapidas solo en el ultimo mensaje */}
                {m.chips?.length && i === messages.length - 1 ? (
                  <View className="flex-row flex-wrap gap-1.5">
                    {m.chips.map((c) => (
                      <Pressable
                        key={c}
                        onPress={() => send(c)}
                        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                      >
                        <Text className="font-plex text-xs text-carbon-gray20">{c}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          )
        )}
        {typing ? <Typing big={big} /> : null}
      </ScrollView>

      <View className={`border-t border-white/10 ${big ? 'p-4' : 'p-3'}`}>
        <View className="w-full flex-row items-center gap-2 self-center" style={{ maxWidth: big ? 780 : undefined }}>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => send()}
            placeholder="Escribe tu pregunta…"
            placeholderTextColor="#6f6f6f"
            returnKeyType="send"
            accessibilityLabel="Mensaje para el bot"
            className={`${big ? 'h-12 text-base' : 'h-10 text-sm'} flex-1 rounded-full bg-white/5 px-4 font-plex text-white`}
            style={WEB ? { outlineStyle: 'none' } : undefined}
          />
          <Pressable
            onPress={() => send()}
            disabled={!text.trim() || typing}
            accessibilityRole="button"
            accessibilityLabel="Enviar"
            className={`${big ? 'h-12 w-12' : 'h-10 w-10'} items-center justify-center rounded-full ${
              text.trim() && !typing ? 'bg-carbon-blue hover:bg-carbon-bluehover' : 'bg-white/10'
            }`}
          >
            <Ionicons name="send" size={big ? 18 : 16} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </>
  );

  // Boton redondo del encabezado.
  const headerBtn = (icon, label, onPress) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="h-8 w-8 items-center justify-center rounded-full hover:bg-white/10"
    >
      <Ionicons name={icon} size={17} color="#c6c6c6" />
    </Pressable>
  );

  // ── Panel grande ──────────────────────────────────────────────────────────
  if (large) {
    const full = width < 700;
    return (
      <View style={{ position: FIXED, top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001 }}>
        {/* Fondo: clic para volver al panel pequeno */}
        <Pressable
          onPress={collapse}
          accessibilityLabel="Reducir chat"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5,7,13,0.7)' }}
        />
        <View
          accessibilityViewIsModal
          className={`overflow-hidden border-white/10 bg-carbon-nightcard ${full ? '' : 'rounded-2xl border'}`}
          style={{
            position: 'absolute',
            top: full ? 0 : Math.max(24, (height - Math.min(760, height - 48)) / 2),
            left: full ? 0 : Math.max(16, (width - Math.min(1040, width - 48)) / 2),
            width: full ? width : Math.min(1040, width - 48),
            height: full ? height : Math.min(760, height - 48),
            ...(WEB && !full ? { boxShadow: '0 30px 80px rgba(0,0,0,0.5)' } : {}),
          }}
        >
          {/* Encabezado con pestanas */}
          <View className="flex-row flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-carbon-night">
              <Image source={MARK} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </View>
            <View className="mr-2">
              <Text className="font-plexsemibold text-sm text-white">BuildWise Bot</Text>
              <Text className="font-plex text-[11px] text-carbon-gray50">
                {tab === 'quick' ? 'Asistente con información del sitio' : 'Chatbot con IA (OpenWebUI)'}
              </Text>
            </View>
            <View className="flex-row gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {[
                { id: 'quick', label: 'Asistente rápido', icon: 'flash-outline' },
                { id: 'full', label: 'Chatbot IA completo', icon: 'sparkles-outline' },
              ].map((o) => {
                const on = tab === o.id;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => setTab(o.id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${on ? 'bg-white/15' : 'hover:bg-white/5'}`}
                  >
                    <Ionicons name={o.icon} size={13} color={on ? '#ffffff' : '#8d8d8d'} />
                    <Text className={`font-plexsemibold text-xs ${on ? 'text-white' : 'text-carbon-gray50'}`}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View className="flex-1" />
            {headerBtn('contract-outline', 'Reducir chat', collapse)}
            {headerBtn('close', 'Cerrar chat', () => setLarge(false))}
          </View>

          {tab === 'quick' ? chat(true) : <FullChat onQuick={() => setTab('quick')} />}
        </View>
      </View>
    );
  }

  // ── Panel pequeno + boton flotante ────────────────────────────────────────
  return (
    <View
      pointerEvents="box-none"
      style={{ position: FIXED, right: small ? 12 : 22, bottom: small ? 12 : 22, zIndex: 1000, alignItems: 'flex-end' }}
    >
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        accessibilityViewIsModal={open}
        style={{
          width: panelW,
          height: panelH,
          marginBottom: 12,
          opacity: pop,
          transform: [
            { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
            { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
          display: open || WEB ? 'flex' : 'none',
          ...(WEB ? { visibility: open ? 'visible' : 'hidden' } : {}),
        }}
        className="overflow-hidden rounded-2xl border border-white/10 bg-carbon-nightcard"
      >
        <View className="flex-row items-center gap-3 border-b border-white/10 px-4 py-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-carbon-night">
            <Image source={MARK} style={{ width: 24, height: 24 }} resizeMode="contain" />
          </View>
          <View className="flex-1">
            <Text className="font-plexsemibold text-sm text-white">BuildWise Bot</Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-carbon-green" />
              <Text className="font-plex text-[11px] text-carbon-gray50">En línea · respuestas automáticas</Text>
            </View>
          </View>
          {headerBtn('expand-outline', 'Agrandar chat', () => expand('quick'))}
          {headerBtn('close', 'Cerrar chat', () => setOpen(false))}
        </View>

        {chat(false)}

        {/* Acceso directo al chatbot completo */}
        <Pressable
          onPress={() => expand('full')}
          className="flex-row items-center justify-center gap-1.5 border-t border-white/10 py-2 hover:bg-white/5"
        >
          <Ionicons name="sparkles-outline" size={12} color="#c498c2" />
          <Text className="font-plex text-xs text-carbon-gray20">Abrir chatbot IA completo</Text>
        </Pressable>
      </Animated.View>

      {/* Burbuja de invitacion */}
      {hint && !open ? (
        <Pressable
          onPress={() => setOpen(true)}
          className="mb-3 rounded-2xl rounded-br-sm border border-white/10 bg-carbon-nightcard px-4 py-2.5"
          style={WEB ? { boxShadow: '0 8px 24px rgba(0,0,0,0.35)' } : undefined}
        >
          <Text className="font-plex text-sm text-white">¿Te ayudo? Pregúntame lo que quieras 👋</Text>
        </Pressable>
      ) : null}

      {/* Boton flotante */}
      <View style={{ width: 60, height: 60 }} className="items-center justify-center">
        {!open ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 60,
              height: 60,
              borderRadius: 30,
              borderWidth: 2,
              borderColor: '#9d6b99',
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) }],
            }}
          />
        ) : null}
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Cerrar chat' : 'Abrir chat con BuildWise Bot'}
          className="h-[60px] w-[60px] items-center justify-center rounded-full border border-white/15 bg-carbon-night active:opacity-90"
          style={WEB ? { boxShadow: '0 10px 30px rgba(157,107,153,0.35)' } : undefined}
        >
          {open ? (
            <Ionicons name="chevron-down" size={24} color="#ffffff" />
          ) : (
            <Image source={MARK} style={{ width: 34, height: 34 }} resizeMode="contain" />
          )}
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Chatbot IA completo (OpenWebUI) incrustado. Antes de mostrarlo comprueba que
 * el servidor responda; si no, ofrece reintentar, abrirlo aparte o volver al
 * asistente rapido.
 */
function FullChat({ onQuick }) {
  const [status, setStatus] = useState('checking'); // checking | ok | offline

  const check = useCallback(async () => {
    setStatus('checking');
    if (!WEB) {
      setStatus('ok'); // en nativo el WebView reporta el error por onError
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    try {
      // no-cors: basta con saber si el servidor contesta.
      await fetch(CHATBOT_URL, { mode: 'no-cors', signal: ctrl.signal });
      setStatus('ok');
    } catch {
      setStatus('offline');
    } finally {
      clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  if (status === 'checking') {
    return (
      <View className="flex-1 items-center justify-center gap-3">
        <ActivityIndicator color="#9d6b99" />
        <Text className="font-plex text-sm text-carbon-gray50">Conectando con el chatbot…</Text>
      </View>
    );
  }

  if (status === 'offline') {
    return (
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Ionicons name="cloud-offline-outline" size={44} color="#6f6f6f" />
        <Text className="text-center font-plexsemibold text-lg text-white">
          El chatbot completo no está disponible ahora
        </Text>
        <Text className="max-w-md text-center font-plex text-sm leading-6 text-carbon-gray50">
          No pudimos conectar con el servidor. Puedes reintentar, abrirlo en otra pestaña o seguir con el
          asistente rápido.
        </Text>
        <View className="mt-2 flex-row flex-wrap justify-center gap-2">
          <Pressable onPress={check} className="rounded-full bg-white px-5 py-2.5 hover:bg-carbon-gray20">
            <Text className="font-plexsemibold text-sm text-carbon-black">Reintentar</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(CHATBOT_URL)}
            className="rounded-full border border-white/15 bg-white/10 px-5 py-2.5 hover:bg-white/20"
          >
            <Text className="font-plexsemibold text-sm text-white">Abrir en otra pestaña</Text>
          </Pressable>
          <Pressable onPress={onQuick} className="rounded-full border border-white/15 px-5 py-2.5 hover:bg-white/10">
            <Text className="font-plexsemibold text-sm text-white">Usar asistente rápido</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {WEB ? (
        <iframe
          src={CHATBOT_URL}
          title="Chatbot BuildWise"
          allow="microphone; clipboard-write"
          style={{ flex: 1, border: 'none', width: '100%', height: '100%', background: '#0c0e14' }}
        />
      ) : (
        <WebView
          source={{ uri: CHATBOT_URL }}
          style={{ flex: 1 }}
          onError={() => setStatus('offline')}
          allowsInlineMediaPlayback
          mediaCapturePermissionGrantType="grant"
        />
      )}
      <Pressable
        onPress={() => Linking.openURL(CHATBOT_URL)}
        className="flex-row items-center justify-center gap-1.5 border-t border-white/10 py-2 hover:bg-white/5"
      >
        <Ionicons name="open-outline" size={12} color="#8d8d8d" />
        <Text className="font-plex text-xs text-carbon-gray50">¿No carga? Ábrelo en otra pestaña</Text>
      </Pressable>
    </View>
  );
}

/** Indicador "escribiendo" (tres puntos). */
function Typing({ big }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: 1, duration: 900, useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [t]);
  return (
    <View className="flex-row items-end gap-2 self-start">
      <Image source={MARK} style={{ width: big ? 26 : 20, height: big ? 26 : 20 }} resizeMode="contain" />
      <View className="flex-row gap-1 rounded-2xl rounded-bl-sm bg-white/[0.06] px-3.5 py-3">
        {[0, 1, 2].map((k) => (
          <Animated.View
            key={k}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: '#c498c2',
              opacity: t.interpolate({
                inputRange: [0, 0.2 + k * 0.2, 0.4 + k * 0.2, 1],
                outputRange: [0.3, 1, 0.3, 0.3],
                extrapolate: 'clamp',
              }),
            }}
          />
        ))}
      </View>
    </View>
  );
}
