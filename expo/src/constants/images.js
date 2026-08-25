// URLs de imagenes (Unsplash). Centralizadas para poder sustituirlas
// facilmente por fotos propias de BuildWise Labs.
const U = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

// Video ambiente de fondo del hero (loop, silenciado). Reemplaza esta URL por
// tu propio video (local con require('../../assets/hero.mp4') o una URL propia).
export const HERO_VIDEO =
  'https://videos.pexels.com/video-files/3129576/3129576-uhd_2560_1440_30fps.mp4';

export const IMAGES = {
  // Imagen principal del hero (Tierra de noche desde el espacio, globo + luces).
  // Para usar tu propia foto: ponla en assets y usa require('../../assets/hero.jpg').
  space: U('1451187580459-43490279c0fa', 1600),
  hero: U('1446776811953-b23d57bd21aa', 1400), // Tierra de noche (ISS)
  automation: U('1518770660439-4636190af475', 800), // circuiteria
  security: U('1550751827-4bd374c3f58b', 800), // ciberseguridad
  apps: U('1531482615713-2afd69097998', 800), // desarrollo / codigo
  aboutOffice: U('1497366216548-37526070297c', 1200), // oficina / equipo
  aboutMeeting: U('1600880292203-757bb62b4baf', 1200), // reunion de equipo
};
