import Starfield from './Starfield';

// En iOS/Android no hay <canvas>: se usa el cielo estrellado estatico.
// La version interactiva vive en BrainGlobeCanvas.web.js.
export default function BrainGlobeCanvas() {
  return <Starfield count={140} />;
}
