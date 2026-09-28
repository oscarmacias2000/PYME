import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MONO = Platform.select({ web: 'ui-monospace, Menlo, Consolas, monospace', default: 'monospace' });

/**
 * Convierte Markdown en bloques. Soporta lo que usan los documentos del
 * equipo: encabezados, citas (prompts), listas, bloques de codigo, separadores
 * y parrafos; en linea, **negritas** y `codigo`.
 */
export function parseMarkdown(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  const isList = (l) => /^\s*([-*]|\d+\.)\s+/.test(l);
  const isSpecial = (l) => /^(```|#{1,4}\s|>|---+\s*$)/.test(l) || isList(l);
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // cierre del bloque
      blocks.push({ type: 'code', lang: fence[1], text: body.join('\n') });
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'heading', level: h[1].length, text: h[2].trim() });
      i += 1;
      continue;
    }
    if (/^---+\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }
    if (line.startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      const raw = body.join('\n');
      blocks.push({ type: 'quote', raw, children: parseMarkdown(raw) });
      continue;
    }
    if (isList(line)) {
      const items = [];
      const ordered = /^\s*\d+\./.test(line);
      while (i < lines.length && isList(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !isSpecial(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'p', text: para.join(' ') });
  }
  return blocks;
}

// Texto plano (para copiar): sin marcas de negrita ni de codigo.
const plain = (md) => md.replace(/\*\*/g, '').replace(/`/g, '').trim();

/** Texto con **negritas** y `codigo` en linea. */
function Inline({ text, className = '' }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <Text className={className}>
      {parts.map((p, k) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return (
            <Text key={k} className="font-plexsemibold text-carbon-black dark:text-white">
              {p.slice(2, -2)}
            </Text>
          );
        if (p.startsWith('`') && p.endsWith('`'))
          return (
            <Text
              key={k}
              style={{ fontFamily: MONO }}
              className="bg-carbon-gray10 text-[13px] text-carbon-blue dark:bg-carbon-gray90"
            >
              {p.slice(1, -1)}
            </Text>
          );
        return <Text key={k}>{p}</Text>;
      })}
    </Text>
  );
}

/** Boton "Copiar" (solo web, via Clipboard API). */
function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  if (Platform.OS !== 'web' || !globalThis.navigator?.clipboard) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    } catch {
      // Sin permiso de portapapeles: no hacemos nada.
    }
  };
  return (
    <Pressable
      onPress={copy}
      accessibilityRole="button"
      accessibilityLabel="Copiar"
      className="flex-row items-center gap-1.5 rounded-full border border-carbon-gray20 px-3 py-1 hover:bg-carbon-gray10 dark:border-carbon-gray90 dark:hover:bg-carbon-gray90"
    >
      <Ionicons name={done ? 'checkmark' : 'copy-outline'} size={13} color={done ? '#24a148' : '#8d8d8d'} />
      <Text className="font-plex text-xs text-carbon-gray70 dark:text-carbon-gray20">
        {done ? 'Copiado' : 'Copiar'}
      </Text>
    </Pressable>
  );
}

function Blocks({ blocks, nested = false }) {
  return blocks.map((b, k) => {
    switch (b.type) {
      case 'heading': {
        const size = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg'][b.level - 1];
        const font = b.level <= 2 ? 'font-plexlight' : 'font-plexsemibold';
        return (
          <Text
            key={k}
            accessibilityRole="header"
            className={`${size} ${font} mb-3 ${k === 0 ? '' : 'mt-8'} text-carbon-black dark:text-white`}
          >
            {b.text}
          </Text>
        );
      }
      case 'hr':
        return nested ? null : <View key={k} className="my-6 h-px bg-carbon-gray20 dark:bg-carbon-gray90" />;
      case 'quote':
        // Prompt listo para copiar.
        return (
          <View
            key={k}
            className="my-3 rounded-xl border border-carbon-gray20 border-l-4 border-l-carbon-blue bg-carbon-gray10 p-4 dark:border-carbon-gray90 dark:border-l-carbon-blue dark:bg-carbon-gray90"
          >
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="sparkles-outline" size={13} color="#9d6b99" />
                <Text className="font-plexsemibold text-[11px] uppercase tracking-wider text-carbon-blue">
                  Prompt
                </Text>
              </View>
              <CopyButton text={plain(b.raw)} />
            </View>
            <Blocks blocks={b.children} nested />
          </View>
        );
      case 'list':
        return (
          <View key={k} className="my-2 gap-1.5">
            {b.items.map((it, j) => (
              <View key={j} className="flex-row gap-2">
                <Text className="w-5 font-plex text-base leading-6 text-carbon-blue">
                  {b.ordered ? `${j + 1}.` : '•'}
                </Text>
                <Inline
                  text={it}
                  className="flex-1 font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20"
                />
              </View>
            ))}
          </View>
        );
      case 'code':
        return (
          <View key={k} className="my-3 rounded-xl bg-carbon-black p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-plex text-[11px] uppercase tracking-wider text-carbon-gray50">
                {b.lang || 'código'}
              </Text>
              <CopyButton text={b.text} />
            </View>
            <Text style={{ fontFamily: MONO }} className="text-[13px] leading-5 text-carbon-gray20">
              {b.text}
            </Text>
          </View>
        );
      default:
        return (
          <Inline
            key={k}
            text={b.text}
            className="my-2 font-plex text-base leading-7 text-carbon-gray70 dark:text-carbon-gray20"
          />
        );
    }
  });
}

/** Renderiza un documento Markdown del equipo con el estilo del sitio. */
export default function MarkdownView({ content }) {
  return (
    <View>
      <Blocks blocks={parseMarkdown(content)} />
    </View>
  );
}
