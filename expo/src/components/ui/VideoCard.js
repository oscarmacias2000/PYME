import { useEffect } from 'react';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

import VideoCardFrame from './VideoCardFrame';

/**
 * Tarjeta de video en bucle (silenciado, autoplay) para iOS/Android con
 * expo-video. En web se usa VideoCard.web.js (<video> nativo del navegador).
 * "Ver en grande" solo existe en web.
 * @param {number|string} source  require('...mp4') o URL
 */
export default function VideoCard({ source, aspectRatio = 16 / 9, ...frame }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { muted } = useEvent(player, 'mutedChange', { muted: player.muted });

  useEffect(() => {
    player.play();
  }, [player]);

  return (
    <VideoCardFrame
      {...frame}
      aspectRatio={aspectRatio}
      onExpand={undefined}
      playing={isPlaying}
      muted={muted}
      onToggle={() => (isPlaying ? player.pause() : player.play())}
      onMute={() => {
        player.muted = !player.muted;
      }}
      media={<VideoView player={player} style={{ width: '100%', height: '100%' }} contentFit="cover" nativeControls={false} />}
    />
  );
}
