import { useEffect, useRef, useState } from 'react';
import { Pressable, Modal, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// getSourceUri no se exporta en el indice de expo-video, pero es la misma funcion
// con la que su VideoView web convierte require('...mp4') en una URL.
import { getSourceUri } from 'expo-video/build/VideoPlayer.web';

import VideoCardFrame from './VideoCardFrame';

/**
 * Tarjeta de video para web con <video autoPlay muted loop> nativo: el propio
 * navegador lo arranca al cargar y lo reanuda al volver a verse en pantalla
 * (con expo-video el play() llega antes de montar y el video se queda quieto).
 * @param {number|string} source    require('...mp4') o URL
 * @param {boolean}       expandable  agrega "Ver en grande" (modal con sonido)
 */
export default function VideoCard({ source, aspectRatio = 16 / 9, expandable = false, ...frame }) {
  const uri = getSourceUri(source);
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [open, setOpen] = useState(false);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const mute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const expand = () => {
    ref.current?.pause();
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    ref.current?.play().catch(() => {});
  };

  // Tamano del video en el modal: lo mas grande posible sin salirse de la pantalla.
  const maxH = height * 0.86;
  const maxW = width * 0.92;
  const boxW = Math.min(maxW, maxH * aspectRatio);
  const boxH = boxW / aspectRatio;

  return (
    <>
      <VideoCardFrame
        {...frame}
        aspectRatio={aspectRatio}
        playing={playing}
        muted={muted}
        onToggle={toggle}
        onMute={mute}
        onExpand={expandable ? expand : undefined}
        media={
          <video
            ref={ref}
            src={uri}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        }
      />

      {expandable && (
        <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
          <Pressable
            onPress={close}
            accessibilityLabel="Cerrar video"
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,6,10,0.88)' }}
          >
            {/* Detener la propagacion: tocar el video no cierra el modal */}
            <Pressable onPress={(e) => e.stopPropagation()} style={{ width: boxW, height: boxH, borderRadius: 16, overflow: 'hidden', backgroundColor: '#000' }}>
              {open ? (
                <video
                  src={uri}
                  autoPlay
                  controls
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              ) : null}
            </Pressable>
            <Pressable
              onPress={close}
              accessibilityLabel="Cerrar video"
              style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' }}
            >
              <Ionicons name="close" size={22} color="#fff" />
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
