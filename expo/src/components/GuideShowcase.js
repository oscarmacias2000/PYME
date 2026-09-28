import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Image, ScrollView, Animated, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CodeBlock from './ui/CodeBlock';
import BrowserMockup from './ui/BrowserMockup';
import InteractiveMockup from './ui/InteractiveMockup';
import NetworkTopology from './ui/NetworkTopology';
import SvgIcon from './ui/SvgIcon';
import Starfield from './ui/Starfield';
import VideoCard from './ui/VideoCard';

const WEB = Platform.OS === 'web';
const FIELD_VIDEO = require('../../assets/videos/caso-campo.mp4');

// Paleta "Malva y pizarra" sobre fondo espacial (igual que el hero).
const C = {
  night: '#0c0e14',
  card: '#151824',
  cardHi: '#1b1f2e',
  line: 'rgba(255,255,255,0.08)',
  lineHi: 'rgba(255,255,255,0.16)',
  accent: '#9d6b99',
  accentSoft: 'rgba(157,107,153,0.16)',
  accentLine: 'rgba(157,107,153,0.5)',
  accentText: '#e0c3de',
  text: '#ffffff',
  body: '#d0d4e0',
  muted: '#a8b0c4',
  dim: '#6b7288',
  green: '#24a148',
};

const LANG_LABEL = { js: 'JavaScript', ts: 'TypeScript', bash: 'Bash', py: 'Python', json: 'JSON' };
const lineCount = (code) => (code ? code.split('\n').length : 0);

// Pasos marcados como completados, por servicio. Se guardan en el navegador
// del visitante (solo comodidad: si el almacenamiento falla, se pierde al recargar).
function useDoneSteps(serviceId) {
  const key = `bw-guide-done:${serviceId}`;
  const [done, setDone] = useState(() => {
    if (!WEB) return [];
    try {
      return JSON.parse(window.localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (!WEB) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(done));
    } catch {}
  }, [key, done]);
  const toggle = (step) => setDone((prev) => (prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]));
  return [done, toggle];
}

function Badge({ label, logo, icon, color, active, onPress }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!active } : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: color || (active ? C.accentSoft : 'rgba(255,255,255,0.05)'),
        borderWidth: 1,
        borderColor: active ? C.accentLine : C.lineHi,
      }}
    >
      {logo ? <Image source={{ uri: logo }} style={{ width: 14, height: 14 }} resizeMode="contain" /> : null}
      {icon ? <Ionicons name={icon} size={12} color={color ? '#fff' : active ? C.accentText : C.muted} /> : null}
      <Text style={{ color: color ? '#fff' : active ? C.accentText : C.body, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 }}>
        {label}
      </Text>
    </Wrapper>
  );
}

function Stat({ value, label }) {
  return (
    <View style={{ minWidth: 110, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(21,24,36,0.8)' }}>
      <Text className="font-plexlight" style={{ color: C.text, fontSize: 30 }}>{value}</Text>
      <Text style={{ color: C.muted, fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value }) {
  return (
    <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <View
        style={{
          height: 4,
          width: `${Math.round(value * 100)}%`,
          backgroundColor: C.accent,
          ...(WEB ? { backgroundImage: 'linear-gradient(90deg, #9d6b99, #7088b3)', transition: 'width 300ms ease' } : {}),
        }}
      />
    </View>
  );
}

// Numero del paso (o palomita si ya se completo).
function StepDot({ n, active, done, size = 26 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: done ? C.green : active ? C.accent : C.card,
        borderWidth: done || active ? 0 : 1,
        borderColor: C.lineHi,
      }}
    >
      {done ? (
        <Ionicons name="checkmark" size={size * 0.55} color="#fff" />
      ) : (
        <Text style={{ color: active ? '#fff' : C.muted, fontSize: 11, fontWeight: '700' }}>{n}</Text>
      )}
    </View>
  );
}

function RailItem({ step, active, done, onPress }) {
  const [hover, setHover] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? C.accentLine : 'transparent',
        backgroundColor: active ? C.accentSoft : hover ? 'rgba(255,255,255,0.04)' : 'transparent',
      }}
    >
      <StepDot n={step.step} active={active} done={done} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ color: active ? C.text : C.body, fontSize: 13, lineHeight: 18, fontWeight: active ? '600' : '400' }}>
          {step.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {step.badge?.logo ? <Image source={{ uri: step.badge.logo }} style={{ width: 12, height: 12 }} resizeMode="contain" /> : null}
          {step.badge ? <Text style={{ color: C.muted, fontSize: 11 }}>{step.badge.label}</Text> : null}
          {step.lang ? <Text style={{ color: C.dim, fontSize: 10, fontFamily: 'monospace' }}>{step.lang.toUpperCase()}</Text> : null}
        </View>
      </View>
      {active ? <Ionicons name="chevron-forward" size={14} color={C.accent} style={{ alignSelf: 'center' }} /> : null}
    </Pressable>
  );
}

function NavButton({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.lineHi,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={16} color={C.text} />
    </Pressable>
  );
}

// Codigo + resultado del paso: topologia, mockup de telefono o de navegador.
function StepMedia({ step, split }) {
  const code = step.code ? <CodeBlock code={step.code} lang={step.lang} playable maxHeight={split ? 460 : 360} /> : null;

  if (step.topology) {
    return (
      <View style={{ gap: 16 }}>
        <NetworkTopology nodes={step.topology.nodes} links={step.topology.links} detail={step.topology.detail} height={320} />
        {code}
      </View>
    );
  }

  if (step.phoneMockup) {
    return (
      <View style={{ flexDirection: split ? 'row' : 'column', gap: 20, alignItems: split ? 'flex-start' : 'stretch' }}>
        <View style={{ flex: split ? 1 : undefined, minWidth: 0 }}>{code}</View>
        <View
          style={{
            width: split ? 300 : '100%',
            alignItems: 'center',
            paddingTop: 14,
            paddingBottom: 18,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.line,
            backgroundColor: C.night,
          }}
        >
          <Starfield count={28} seed={step.step * 11} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#78c8a0' }} />
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Vista previa · toca los botones
            </Text>
          </View>
          <InteractiveMockup screens={step.phoneMockup.screens} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 16 }}>
      {code}
      {step.mockup ? <BrowserMockup uri={step.mockup.uri} url={step.mockup.url} height={step.mockup.height || 320} /> : null}
    </View>
  );
}

/**
 * Guia de inicio rapido a todo el ancho: riel con los pasos, progreso, video y
 * llamado a la accion a la izquierda; el paso activo (codigo reproducible +
 * vista previa) a la derecha. Filtra los pasos por proveedor con los badges.
 */
export default function GuideShowcase({ service, onContact }) {
  const guide = service.guide;
  const { width, height } = useWindowDimensions();
  const wide = width >= 1100;
  const split = wide ? width >= 1280 : width >= 820;
  const stickyRail = WEB && wide && height >= 760;

  const [filter, setFilter] = useState(null);
  const [activeStep, setActiveStep] = useState(guide[0].step);
  const [done, toggleDone] = useDoneSteps(service.id);
  const panelRef = useRef(null);
  const anim = useRef(new Animated.Value(1)).current;

  const providers = useMemo(() => {
    const map = new Map();
    guide.forEach((s) => {
      if (!s.badge) return;
      const p = map.get(s.badge.label) || { ...s.badge, count: 0 };
      p.count += 1;
      map.set(s.badge.label, p);
    });
    return [...map.values()];
  }, [guide]);
  const langs = useMemo(() => [...new Set(guide.map((s) => s.lang).filter(Boolean))], [guide]);
  const totalLines = useMemo(() => guide.reduce((n, s) => n + lineCount(s.code), 0), [guide]);

  const steps = filter ? guide.filter((s) => s.badge?.label === filter) : guide;
  const active = guide.find((s) => s.step === activeStep) || guide[0];
  const pos = steps.findIndex((s) => s.step === active.step);
  const prev = pos > 0 ? steps[pos - 1] : null;
  const next = pos >= 0 && pos < steps.length - 1 ? steps[pos + 1] : null;
  const isDone = done.includes(active.step);
  const doneCount = guide.filter((s) => done.includes(s.step)).length;

  // Entrada suave del panel al cambiar de paso.
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: false }).start();
  }, [activeStep, anim]);

  const select = (step) => {
    setActiveStep(step);
    // En web, si el inicio del panel quedo arriba de la pantalla, lo trae a la vista.
    const node = panelRef.current;
    if (WEB && node?.getBoundingClientRect && node.getBoundingClientRect().top < 0) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const applyFilter = (label) => {
    const nextFilter = filter === label ? null : label;
    setFilter(nextFilter);
    const list = nextFilter ? guide.filter((s) => s.badge?.label === nextFilter) : guide;
    if (list.length && !list.some((s) => s.step === activeStep)) setActiveStep(list[0].step);
  };

  // Video de campo (vertical) junto a los pasos.
  const fieldVideo = (
    <VideoCard
      source={FIELD_VIDEO}
      aspectRatio={9 / 16}
      portrait
      expandable
      title="Míralo en campo"
      subtitle="Del recorrido en campo al reporte en Excel."
      badges={[{ label: 'VIDEO', icon: 'videocam', color: C.accent }, { label: '0:41' }]}
    />
  );

  const cta = (
    <View style={{ padding: 18, borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="rocket-outline" size={16} color={C.accent} />
        <Text style={{ color: C.text, fontSize: 14, fontWeight: '600' }}>¿Lo quieres en tu empresa?</Text>
      </View>
      <Text style={{ color: C.muted, fontSize: 12, lineHeight: 18 }}>
        Lo implementamos contigo: desde el primer prototipo hasta producción.
      </Text>
      {onContact ? (
        <Pressable
          onPress={onContact}
          style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: C.accent }}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Hablemos</Text>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={{ width: '100%', backgroundColor: C.night, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line }}>
      <Starfield count={110} seed={service.id.length * 7} />
      <View style={{ width: '100%', maxWidth: 1600, alignSelf: 'center', paddingHorizontal: wide ? 48 : 20, paddingVertical: wide ? 72 : 48 }}>
        {/* Encabezado */}
        <View style={{ flexDirection: wide ? 'row' : 'column', justifyContent: 'space-between', alignItems: wide ? 'center' : 'stretch', gap: 32 }}>
          <View style={{ flex: wide ? 1 : undefined, maxWidth: 820 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 28, height: 2, backgroundColor: C.accent }} />
              <Text style={{ color: C.accentText, fontSize: 12, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Documentación · {service.title}
              </Text>
            </View>
            <Text className="font-plexlight" style={{ color: C.text, fontSize: wide ? 46 : 32, lineHeight: wide ? 54 : 40, marginTop: 12 }}>
              Guía de inicio rápido
            </Text>
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
              Código listo para copiar y una vista previa de cada resultado. Dale play al código para verlo
              escribirse, marca los pasos que ya hiciste y avanza a tu ritmo.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
              <Stat value={guide.length} label="pasos" />
              <Stat value={providers.length} label={providers.length === 1 ? 'proveedor' : 'proveedores'} />
              <Stat value={totalLines} label="líneas de código" />
            </View>
          </View>
          <View style={{ width: wide ? 440 : '100%' }}>{fieldVideo}</View>
        </View>

        {/* Filtros por proveedor + lenguajes */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 28 }}>
          {providers.length > 1 && (
            <>
              <Text style={{ color: C.dim, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginRight: 4 }}>Filtrar</Text>
              <Badge label={`Todos · ${guide.length}`} active={!filter} onPress={() => applyFilter(null)} />
              {providers.map((p) => (
                <Badge key={p.label} label={`${p.label} · ${p.count}`} logo={p.logo} active={filter === p.label} onPress={() => applyFilter(p.label)} />
              ))}
              <View style={{ width: 1, height: 18, backgroundColor: C.lineHi, marginHorizontal: 6 }} />
            </>
          )}
          {langs.map((l) => (
            <Badge key={l} icon="code-slash" label={LANG_LABEL[l] || l.toUpperCase()} />
          ))}
          <Badge icon="play-circle-outline" label="Código reproducible" />
        </View>

        {/* Pasos en movil: carrusel horizontal */}
        {!wide && (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: C.muted, fontSize: 12 }}>Progreso</Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>{doneCount} de {guide.length}</Text>
            </View>
            <ProgressBar value={doneCount / guide.length} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 14 }}>
              {steps.map((s) => {
                const on = s.step === active.step;
                return (
                  <Pressable
                    key={s.step}
                    onPress={() => select(s.step)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220, paddingVertical: 8, paddingLeft: 8, paddingRight: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? C.accentLine : C.line, backgroundColor: on ? C.accentSoft : C.card }}
                  >
                    <StepDot n={s.step} active={on} done={done.includes(s.step)} size={22} />
                    <Text numberOfLines={1} style={{ color: on ? C.text : C.body, fontSize: 12, flexShrink: 1 }}>{s.title}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Cuerpo: riel + paso activo */}
        <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: 28, marginTop: wide ? 36 : 20 }}>
          {wide && (
            <View style={{ width: 340, gap: 16, ...(stickyRail ? { position: 'sticky', top: 20 } : {}) }}>
              <View style={{ borderRadius: 16, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, paddingVertical: 14 }}>
                <View style={{ paddingHorizontal: 16, gap: 8, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.text, fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>Pasos</Text>
                    <Text style={{ color: C.muted, fontSize: 12 }}>{doneCount} de {guide.length} completados</Text>
                  </View>
                  <ProgressBar value={doneCount / guide.length} />
                </View>
                <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ paddingHorizontal: 8, gap: 2 }} nestedScrollEnabled>
                  {steps.map((s) => (
                    <RailItem key={s.step} step={s} active={s.step === active.step} done={done.includes(s.step)} onPress={() => select(s.step)} />
                  ))}
                </ScrollView>
              </View>
              {cta}
            </View>
          )}

          <View ref={panelRef} style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', minWidth: 0, ...(WEB ? { scrollMarginTop: 20 } : {}) }}>
            <Animated.View
              style={{
                opacity: anim,
                transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                borderRadius: 20,
                borderWidth: 1,
                borderColor: C.line,
                backgroundColor: C.card,
                overflow: 'hidden',
                ...(WEB ? { boxShadow: '0 30px 80px rgba(0,0,0,0.35)' } : {}),
              }}
            >
              {/* Encabezado del paso */}
              <View style={{ padding: wide ? 28 : 18, gap: 14, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: C.accentText, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
                    PASO {active.step} DE {guide.length}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <NavButton icon="chevron-back" label="Paso anterior" disabled={!prev} onPress={() => prev && select(prev.step)} />
                    <NavButton icon="chevron-forward" label="Paso siguiente" disabled={!next} onPress={() => next && select(next.step)} />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  {active.svgIcon ? (
                    <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                      <SvgIcon svg={active.svgIcon} size={40} />
                    </View>
                  ) : null}
                  <Text className="font-plexsemibold" style={{ flex: 1, color: C.text, fontSize: wide ? 28 : 22, lineHeight: wide ? 36 : 30 }}>
                    {active.title}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {active.badge ? <Badge label={active.badge.label} logo={active.badge.logo} color={active.badge.color} /> : null}
                  {active.lang ? <Badge icon="code-slash" label={LANG_LABEL[active.lang] || active.lang.toUpperCase()} /> : null}
                  {active.code ? <Badge icon="reorder-four-outline" label={`${lineCount(active.code)} líneas`} /> : null}
                  {active.phoneMockup ? <Badge icon="phone-portrait-outline" label="Vista previa interactiva" /> : null}
                  {active.topology ? <Badge icon="git-network-outline" label="Topología de red" /> : null}
                  {isDone ? <Badge icon="checkmark-circle" label="Completado" color={C.green} /> : null}
                </View>
                <Text style={{ color: C.muted, fontSize: 15, lineHeight: 24 }}>{active.description}</Text>
              </View>

              {/* Codigo + resultado */}
              <View style={{ padding: wide ? 28 : 14 }}>
                <StepMedia step={active} split={split} />
              </View>

              {/* Navegacion y marcar como hecho */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: wide ? 28 : 18, paddingVertical: 16, borderTopWidth: 1, borderTopColor: C.line }}>
                <Pressable disabled={!prev} onPress={() => prev && select(prev.step)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, opacity: prev ? 1 : 0.35 }}>
                  <Ionicons name="arrow-back" size={14} color={C.muted} />
                  <Text numberOfLines={1} style={{ color: C.muted, fontSize: 13, flexShrink: 1 }}>{prev ? prev.title : 'Inicio'}</Text>
                </Pressable>
                <Pressable
                  onPress={() => toggleDone(active.step)}
                  accessibilityRole="button"
                  accessibilityState={{ checked: isDone }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: isDone ? 'rgba(36,161,72,0.16)' : C.accent, borderWidth: 1, borderColor: isDone ? C.green : C.accent }}
                >
                  <Ionicons name={isDone ? 'checkmark-circle' : 'checkmark-circle-outline'} size={15} color={isDone ? '#6fdc8c' : '#fff'} />
                  <Text style={{ color: isDone ? '#6fdc8c' : '#fff', fontSize: 13, fontWeight: '600' }}>
                    {isDone ? 'Completado' : 'Marcar como completado'}
                  </Text>
                </Pressable>
                <Pressable disabled={!next} onPress={() => next && select(next.step)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, opacity: next ? 1 : 0.35 }}>
                  <Text numberOfLines={1} style={{ color: C.text, fontSize: 13, flexShrink: 1 }}>{next ? next.title : 'Fin de la guía'}</Text>
                  <Ionicons name="arrow-forward" size={14} color={C.text} />
                </Pressable>
              </View>
            </Animated.View>
          </View>

          {!wide && (
            <View style={{ width: '100%' }}>{cta}</View>
          )}
        </View>
      </View>
    </View>
  );
}
