import { useEffect, useRef, useState } from 'react';
import { View, Pressable, Platform } from 'react-native';

/**
 * Menu desplegable. `trigger(open)` renderiza el disparador;
 * `children(close)` el contenido del panel. En web se cierra al hacer
 * clic fuera.
 * @param {'left'|'right'} align  alineacion del panel
 */
export default function Dropdown({ trigger, children, width = 240, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const onDocClick = (e) => {
      // Cierra si el clic ocurre fuera del contenedor del dropdown.
      const node = ref.current;
      if (node && node.contains && !node.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <View ref={ref} className="relative h-full justify-center">
      <Pressable className="h-full justify-center" onPress={() => setOpen((o) => !o)}>
        {trigger(open)}
      </Pressable>

      {open ? (
        <View
          className="absolute z-50 border border-carbon-gray20 dark:border-carbon-gray90 bg-white dark:bg-carbon-black"
          style={{
            top: 48,
            width,
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            // Sombra sutil estilo Carbon.
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          }}
        >
          {children(() => setOpen(false))}
        </View>
      ) : null}
    </View>
  );
}
