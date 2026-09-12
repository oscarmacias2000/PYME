import { View, Text, Pressable, ScrollView, Image, useWindowDimensions } from 'react-native';
import { useRef, useState, useEffect, useCallback } from 'react';

// ── Datos ────────────────────────────────────────────────────────────────────
export const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Carlos Verde',
    role: 'Supervisor de Campo',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'El chatbot nos ahorra horas cada semana. Antes tardabamos media manana llenando el reporte de poda; ahora lo dictamos por voz en dos minutos y el Excel ya esta listo.',
  },
  {
    id: 't2',
    name: 'Saul Guzman',
    role: 'Gerente de Operaciones',
    avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
    quote: 'Teniamos miedo de que la IA fuera complicada para el equipo. BuildWise lo configuró todo y en una semana todos los operadores ya mandaban sus registros sin problema.',
  },
  {
    id: 't3',
    name: 'David Sarabia',
    role: 'Responsable de Insumos',
    avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
    quote: 'El visor de reportes me permite ver el consumo de fertilizantes de la semana desde el celular. Ya no necesito pedir el archivo a nadie.',
  },
  {
    id: 't4',
    name: 'Jose Ramon Jara',
    role: 'Coordinador de Huerta',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    quote: 'La automatizacion de flujos nos conecto el reporte de campo con nuestro grupo de WhatsApp. El jefe recibe el resumen diario automatico sin que nadie lo tenga que enviar.',
  },
  {
    id: 't5',
    name: 'Victor Manuel Jara',
    role: 'Operador de Maquinaria',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    quote: 'Antes llenaba el reporte de combustible en papel y alguien lo pasaba al Excel. Ahora solo digo cuantos litros cargué y listo. Muy facil.',
  },
];

const CARD_W = 288;
const CARD_GAP = 16;
const CAROUSEL_SPEED = 3500;


// ── Tarjeta individual ──────────────────────────────────────────────────────
function TestimonialCard({ item, active, onHover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onHoverIn={() => { setHovered(true); onHover(true); }}
      onHoverOut={() => { setHovered(false); onHover(false); }}
      onPressIn={() => onHover(true)}
      onPressOut={() => onHover(false)}
      style={{
        backgroundColor: hovered ? '#1a2e1e' : '#1c1c1e',
        borderWidth: 1.5,
        borderColor: hovered ? '#52b788' : active ? '#2d6a4f' : '#2c2c2e',
        borderRadius: 14,
        padding: 20,
        width: CARD_W,
        marginRight: CARD_GAP,
        gap: 14,
        shadowColor: hovered ? '#52b788' : 'transparent',
        shadowOpacity: hovered ? 0.4 : 0,
        shadowRadius: 14,
        elevation: hovered ? 10 : 0,
        transform: [{ scale: hovered ? 1.025 : 1 }],
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Image
          source={{ uri: item.avatar }}
          style={{
            width: 44, height: 44, borderRadius: 22,
            borderWidth: 2,
            borderColor: hovered ? '#52b788' : active ? '#40916c' : '#333',
          }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
          <Text style={{ color: hovered ? '#74c69d' : '#6b7280', fontSize: 12, marginTop: 2 }}>{item.role}</Text>
        </View>
        {active && (
          <View style={{ backgroundColor: '#1a472a', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#52b788', fontSize: 10, fontWeight: '600' }}>Activo</Text>
          </View>
        )}
      </View>
      <Text style={{ color: hovered ? '#e5e7eb' : '#d1d5db', fontSize: 13, lineHeight: 21 }}>
        "{item.quote}"
      </Text>
    </Pressable>
  );
}

// ── Carousel de testimonios ─────────────────────────────────────────────────
function TestimonialsCarousel({ activeIdx, setActiveIdx, paused, setPaused }) {
  const scrollRef = useRef(null);

  const advance = useCallback(() => {
    setActiveIdx((prev) => {
      const next = (prev + 1) % TESTIMONIALS.length;
      scrollRef.current?.scrollTo({ x: next * (CARD_W + CARD_GAP), animated: true });
      return next;
    });
  }, [setActiveIdx]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, CAROUSEL_SPEED);
    return () => clearInterval(id);
  }, [paused, advance]);

  return (
    <View style={{ paddingTop: 56, paddingBottom: 32 }}>
      {/* Encabezado */}
      <View style={{ paddingHorizontal: 24, marginBottom: 36, gap: 10 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: '#1e2a3a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '600' }}>Lo que dicen nuestros clientes</Text>
        </View>
        <Text style={{ color: '#ffffff', fontSize: 30, fontWeight: '300' }}>No solo lo decimos nosotros.</Text>
        <Text style={{ color: '#9ca3af', fontSize: 15 }}>Equipos agricolas que ya automatizan su operacion diaria.</Text>

        {/* Dots indicadores */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
          {TESTIMONIALS.map((_, i) => (
            <Pressable key={i} onPress={() => {
              scrollRef.current?.scrollTo({ x: i * (CARD_W + CARD_GAP), animated: true });
              setActiveIdx(i);
            }}>
              <View style={{
                width: activeIdx === i ? 24 : 8, height: 8,
                borderRadius: 4,
                backgroundColor: activeIdx === i ? '#52b788' : '#333',
              }} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setPaused(true)}
        onScrollEndDrag={() => setPaused(false)}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
      >
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard
            key={t.id}
            item={t}
            active={i === activeIdx}
            onHover={(h) => {
              setPaused(h);
              if (h) setActiveIdx(i);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Sección completa: carousel + mockup ─────────────────────────────────────
export default function TestimonialsSection() {
  const { width } = useWindowDimensions();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const showMockup = width >= 900;

  return (
    <View style={{ backgroundColor: '#0d0d0f' }}>
      <TestimonialsCarousel
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        paused={paused}
        setPaused={setPaused}
      />

    </View>
  );
}
