import { View, Text, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';

const _TOOLS = [
  {
    name: 'Git',
    category: 'Control de versiones',
    color: '#F05032',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92"><path fill="#F05032" d="M90.156 41.965L50.036 1.85a5.918 5.918 0 0 0-8.372 0l-8.328 8.331 10.566 10.567a7.03 7.03 0 0 1 7.259 1.73 7.04 7.04 0 0 1 1.72 7.299l10.184 10.184a7.028 7.028 0 0 1 7.297 1.72 7.05 7.05 0 0 1 0 9.957 7.05 7.05 0 0 1-9.953 0 7.066 7.066 0 0 1-1.536-7.66l-9.5-9.499v24.997a7.05 7.05 0 0 1 1.86 11.29 7.05 7.05 0 0 1-9.953 0 7.05 7.05 0 0 1 0-9.957 7.055 7.055 0 0 1 2.304-1.539V33.926a7.035 7.035 0 0 1-3.82-9.234L29.244 14.163 1.734 41.67a5.918 5.918 0 0 0 0 8.373L41.855 90.16a5.92 5.92 0 0 0 8.37 0l39.93-39.924a5.925 5.925 0 0 0 0-8.271"/></svg>`,
  },
  {
    name: 'GitHub',
    category: 'Repositorios',
    color: '#ffffff',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  },
  {
    name: 'Node.js',
    category: 'Runtime',
    color: '#5FA04E',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#5FA04E" d="M16 30a2.151 2.151 0 0 1-1.076-.288L11.5 27.685c-.511-.286-.262-.387-.093-.446a6.8 6.8 0 0 0 1.538-.7.263.263 0 0 1 .254.019l2.637 1.563a.34.34 0 0 0 .318 0l10.26-5.922a.323.323 0 0 0 .159-.278V10.075a.331.331 0 0 0-.162-.281L16.158 3.875a.323.323 0 0 0-.317 0L5.581 9.794a.33.33 0 0 0-.162.281v11.843a.315.315 0 0 0 .161.274l2.814 1.624c1.526.763 2.459-.136 2.459-1.038V11.085a.3.3 0 0 1 .3-.3h1.3a.3.3 0 0 1 .3.3v11.693c0 2.031-1.107 3.195-3.031 3.195a4.392 4.392 0 0 1-2.363-.642L4.733 23.82a2.166 2.166 0 0 1-1.076-1.875V10.075a2.166 2.166 0 0 1 1.076-1.872l10.26-5.924a2.246 2.246 0 0 1 2.154 0L27.407 8.2a2.166 2.166 0 0 1 1.076 1.872v11.869a2.176 2.176 0 0 1-1.076 1.875l-10.26 5.922A2.152 2.152 0 0 1 16 30zm3.093-8.01c-4.493 0-5.427-2.062-5.427-3.792a.3.3 0 0 1 .3-.3h1.327a.3.3 0 0 1 .3.256c.2 1.377.8 2.073 3.5 2.073 2.156 0 3.073-.488 3.073-1.629 0-.658-.261-1.148-3.612-1.476-2.8-.278-4.532-.9-4.532-3.14 0-2.07 1.745-3.305 4.67-3.305 3.287 0 4.914 1.141 5.12 3.589a.3.3 0 0 1-.3.323H22.19a.3.3 0 0 1-.295-.249c-.32-1.42-1.1-1.875-3.07-1.875-2.263 0-2.527.787-2.527 1.378 0 .717.311.926 3.5 1.329 3.157.4 4.636 1.008 4.636 3.272 0 2.236-1.864 3.546-5.341 3.546z"/></svg>`,
  },
  {
    name: 'Linux',
    category: 'Sistema operativo',
    color: '#FCC624',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FCC624" d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.567 1.564 1.182 2.114.623.554 1.535.954 2.774.954 1.248 0 2.15-.266 2.779-.785 1.088-.9 1.324-2.2 1.324-3.396 0-.84-.15-1.655-.213-2.453-.064-.801.016-1.553.348-2.118.656-1.104 2.02-1.734 3.176-1.734.916 0 1.822.39 2.438 1.104.617.713.938 1.682.938 2.704 0 1.219-.449 2.309-.756 3.018a14.73 14.73 0 0 0-.531 1.509c-.104.393-.149.766-.149 1.106 0 .633.187 1.22.553 1.643.362.421.915.654 1.524.654.73 0 1.356-.34 1.813-.953.455-.611.697-1.469.697-2.338 0-.564-.106-1.174-.313-1.774-.207-.6-.52-1.201-.859-1.764-.34-.564-.707-1.093-1.012-1.578-.305-.485-.549-.924-.635-1.298-.152-.665-.168-1.337-.168-2.015 0-.641.008-1.289.008-1.942 0-2.074-.283-3.977-1.148-5.244C16.51.473 14.734 0 12.504 0zM9.77 7.246c.386-.107.726-.001.978.317.252.318.315.81.117 1.222-.198.411-.606.625-1.022.558-.416-.067-.748-.386-.83-.779-.083-.393.038-.836.31-1.103.12-.117.278-.185.448-.215zm4.9 0c.39.105.622.47.603.9-.019.432-.261.786-.613.905-.352.118-.74-.033-.952-.377-.212-.343-.19-.81.054-1.162.244-.353.619-.47.908-.266zm-2.38 1.564c.31.066.548.273.548.273s.106.142.106.389c0 .246-.142.49-.427.617-.286.128-.621.105-.861-.059-.24-.164-.371-.445-.321-.715.05-.27.274-.48.568-.513.119-.013.247-.004.388.008zm-6.207 9.032c.12.437.24.816.35 1.128.219.617.477 1.092.785 1.454.309.362.674.622 1.098.745.425.122.92.109 1.481-.05.56-.159 1.099-.504 1.536-1.034.438-.531.773-1.249.894-2.115.121-.867-.019-1.744-.37-2.526-.352-.782-.913-1.466-1.57-1.964-.657-.499-1.407-.815-2.13-.881-.722-.066-1.414.106-1.966.542-.553.435-.95 1.134-1.003 1.985-.053.852.116 1.849.895 2.716zm12.27.002c.78-.864.955-1.86.904-2.713-.051-.853-.451-1.553-1.006-1.988-.554-.434-1.244-.607-1.966-.54-.722.066-1.472.383-2.128.882-.656.499-1.217 1.183-1.57 1.964-.35.781-.49 1.659-.37 2.526.121.866.456 1.584.895 2.115.438.53.977.875 1.536 1.034.56.159 1.056.172 1.481.05.424-.123.788-.383 1.097-.745.31-.362.567-.837.786-1.454.11-.312.23-.691.35-1.128l-.01-.003z"/></svg>`,
  },
  {
    name: 'Fish Shell',
    category: 'Terminal',
    color: '#41C0FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><text x="50" y="22" text-anchor="middle" font-size="11" font-family="monospace" fill="#41C0FF" font-weight="bold">$ fish</text><text x="50" y="40" text-anchor="middle" font-size="10" font-family="monospace" fill="#41C0FF" opacity="0.6">~&gt; _</text><rect x="8" y="4" width="84" height="50" rx="8" fill="none" stroke="#41C0FF" stroke-width="2" opacity="0.4"/></svg>`,
  },
  {
    name: 'Python',
    category: 'Lenguaje',
    color: '#3776AB',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#3776AB" d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.898S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.868s-.109-3.402 3.35-3.402h5.769s3.24.052 3.24-3.131V3.129S18.316 0 11.914 0zm-3.2 1.812a1.038 1.038 0 1 1 0 2.077 1.038 1.038 0 0 1 0-2.077z"/><path fill="#FFD43B" d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.123S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.868s.109 3.402-3.35 3.402H9.447s-3.24-.052-3.24 3.131v5.271S5.684 24 12.086 24zm3.2-1.812a1.038 1.038 0 1 1 0-2.077 1.038 1.038 0 0 1 0 2.077z"/></svg>`,
  },
  {
    name: 'Cisco',
    category: 'Redes',
    color: '#1BA0D7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><g fill="#1BA0D7"><rect x="46" y="0" width="8" height="14" rx="2"/><rect x="46" y="36" width="8" height="14" rx="2"/><rect x="14" y="12" width="8" height="10" rx="2"/><rect x="78" y="12" width="8" height="10" rx="2"/><rect x="22" y="6" width="8" height="10" rx="2"/><rect x="70" y="6" width="8" height="10" rx="2"/><rect x="30" y="2" width="8" height="10" rx="2"/><rect x="62" y="2" width="8" height="10" rx="2"/><rect x="14" y="28" width="8" height="10" rx="2"/><rect x="78" y="28" width="8" height="10" rx="2"/><rect x="22" y="34" width="8" height="10" rx="2"/><rect x="70" y="34" width="8" height="10" rx="2"/><rect x="30" y="38" width="8" height="10" rx="2"/><rect x="62" y="38" width="8" height="10" rx="2"/></g></svg>`,
  },
  {
    name: 'Juniper',
    category: 'Redes',
    color: '#84B135',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><text x="60" y="34" text-anchor="middle" font-size="15" font-weight="800" font-family="sans-serif" fill="#84B135" letter-spacing="-0.5">JUNIPER</text><text x="60" y="48" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#84B135" opacity="0.6" letter-spacing="2">NETWORKS</text></svg>`,
  },
  {
    name: 'GNS3',
    category: 'Simulacion de redes',
    color: '#00ADEF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><text x="50" y="38" text-anchor="middle" font-size="28" font-weight="900" font-family="sans-serif" fill="#00ADEF" letter-spacing="1">GNS3</text><rect x="4" y="4" width="92" height="52" rx="6" fill="none" stroke="#00ADEF" stroke-width="2" opacity="0.35"/></svg>`,
  },
];

function ToolCard({ tool }) {
  const [hovered, setHovered] = useState(false);
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <Pressable
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{
        width: 160,
        backgroundColor: hovered
          ? dark ? '#1a1a2e' : '#f0f4ff'
          : dark ? '#1c1c1e' : '#ffffff',
        borderWidth: 1.5,
        borderColor: hovered ? tool.color : dark ? '#2c2c2e' : '#e0e0e0',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        gap: 10,
        shadowColor: hovered ? tool.color : '#000',
        shadowOpacity: hovered ? 0.28 : 0.06,
        shadowRadius: hovered ? 16 : 4,
        shadowOffset: { width: 0, height: hovered ? 6 : 2 },
        elevation: hovered ? 8 : 2,
        transform: [{ scale: hovered ? 1.045 : 1 }],
      }}
    >
      <Image
        source={{ uri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tool.svg)}` }}
        style={{ width: 54, height: 40 }}
        resizeMode="contain"
      />
      <Text style={{ color: dark ? '#f0f6fc' : '#161616', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
        {tool.name}
      </Text>
      <Text style={{ color: dark ? '#8b949e' : '#525252', fontSize: 10, textAlign: 'center', lineHeight: 14 }}>
        {tool.category}
      </Text>
      <View style={{ height: 2, width: 28, borderRadius: 1, backgroundColor: hovered ? tool.color : dark ? '#333' : '#e0e0e0' }} />
    </Pressable>
  );
}

export default function ToolsGrid() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  return (
    <View style={{ paddingVertical: 48, marginBottom: 16 }}>
      <Text style={{ color: dark ? '#6b7280' : '#8d8d8d', fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>
        Tecnologias y herramientas
      </Text>
      <Text style={{ color: dark ? '#f0f6fc' : '#161616', fontSize: 22, fontWeight: '300', textAlign: 'center', marginBottom: 36 }}>
        Stack de infraestructura y desarrollo
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {_TOOLS.map((t) => (
          <ToolCard key={t.name} tool={t} />
        ))}
      </View>
    </View>
  );
}
