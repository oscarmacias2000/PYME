import Starfield from './Starfield';

// En iOS/Android no hay <canvas>: se usa el cielo estrellado estatico.
// La version interactiva vive en AutomationCanvas.web.js.
export default function AutomationCanvas() {
  return <Starfield count={140} />;
}
