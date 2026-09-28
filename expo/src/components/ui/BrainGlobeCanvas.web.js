import { useEffect, useRef } from 'react';

import { LAND_H, LAND_MASK_B64, LAND_W } from '../../constants/landMask';

// Longitud que mira a la camara al cargar (America) e inclinacion de la vista
// (negativa: se ve un poco desde el norte, donde hay mas continentes).
const START_LON = (-80 * Math.PI) / 180;
const TILT = -0.3;

// Generador pseudoaleatorio con semilla (planeta identico en cada carga).
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Decodifica la mascara tierra/oceano y marca las costas (celdas de tierra
 * con algun vecino de oceano) para dibujar el contorno de los continentes.
 */
function decodeLand() {
  const bin = atob(LAND_MASK_B64);
  const land = new Uint8Array(LAND_W * LAND_H);
  for (let i = 0; i < land.length; i += 1) land[i] = (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
  const coast = new Uint8Array(land.length);
  for (let y = 0; y < LAND_H; y += 1) {
    for (let x = 0; x < LAND_W; x += 1) {
      const i = y * LAND_W + x;
      if (!land[i]) continue;
      const l = y * LAND_W + ((x + LAND_W - 1) % LAND_W);
      const r = y * LAND_W + ((x + 1) % LAND_W);
      const u = y > 0 ? i - LAND_W : i;
      const d = y < LAND_H - 1 ? i + LAND_W : i;
      if (!land[l] || !land[r] || !land[u] || !land[d]) coast[i] = 1;
    }
  }
  // Celda (fila desde el norte, columna desde -180) de una latitud/longitud en grados.
  const cell = (lat, lon) => {
    const row = Math.min(LAND_H - 1, Math.max(0, Math.floor(90 - lat)));
    const col = Math.min(LAND_W - 1, Math.max(0, Math.floor(lon + 180)));
    return row * LAND_W + col;
  };
  return { land, coast, cell };
}

// Ruido de valor 3D (0..1) con semilla: genera continentes y circunvoluciones
// de forma procedural, sin texturas.
function makeNoise(seed) {
  const rnd = seeded(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i += 1) perm[i] = p[i & 255];
  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const h = (x, y, z) => perm[perm[perm[x & 255] + (y & 255)] + (z & 255)] / 255;
  const noise = (x, y, z) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const zf = fade(z - zi);
    const c = (dx, dy, dz) => h(xi + dx, yi + dy, zi + dz);
    return lerp(
      lerp(lerp(c(0, 0, 0), c(1, 0, 0), xf), lerp(c(0, 1, 0), c(1, 1, 0), xf), yf),
      lerp(lerp(c(0, 0, 1), c(1, 0, 1), xf), lerp(c(0, 1, 1), c(1, 1, 1), xf), yf),
      zf
    );
  };
  const fbm = (x, y, z) =>
    noise(x, y, z) * 0.55 + noise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + noise(x * 4.3, y * 4.3, z * 4.3) * 0.15;
  return { noise, fbm };
}

// Paleta (tokens de la marca, version tenue "Malva y pizarra").
const PALETTE = [
  [160, 185, 222], // 0 circunvolucion (pizarra claro)
  [198, 152, 194], // 1 circunvolucion (malva claro)
  [112, 128, 168], // 2 relleno de continente
  [70, 86, 128], // 3 oceano
  [232, 198, 142], // 4 sinapsis ambar
  [150, 206, 180], // 5 sinapsis verde
];
// Brillo por profundidad: cara oculta, borde, cara visible.
const DEPTH_ALPHA = [0.1, 0.32, 0.85];

/**
 * Puntos del planeta-cerebro sobre una esfera unitaria (espiral de
 * Fibonacci). Los continentes son los reales (mascara de NASA): la costa se
 * dibuja como contorno brillante y, dentro de la tierra, bandas de ruido
 * deformado forman las circunvoluciones del "cerebro".
 * Convencion: "y" crece hacia abajo; latitud = asin(-y) y longitud =
 * atan2(z, -x), para que el este quede a la derecha como en un globo real.
 */
function buildGlobe(small) {
  const rnd = seeded(11);
  const { noise, fbm } = makeNoise(7);
  const geo = decodeLand();
  const DEG = 180 / Math.PI;
  const M = small ? 30000 : 60000;
  const pts = [];
  const gyri = [];
  for (let i = 0; i < M; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / M;
    const r = Math.sqrt(1 - y * y);
    const t = i * 2.399963; // angulo aureo
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    const k = geo.cell(Math.asin(-y) * DEG, Math.atan2(z, -x) * DEG);
    const land = geo.land[k] === 1;
    let c = -1;
    if (geo.coast[k]) {
      // Contorno del continente.
      if (rnd() < 0.85) c = 0;
    } else if (land) {
      const wv = fbm(x * 3 + 11, y * 3 + 11, z * 3 + 11) * 1.6;
      const g = Math.abs(Math.sin(noise(x * 2.6 + wv, y * 2.6 + wv, z * 2.6 + wv) * 26));
      if (g < 0.34) {
        c = rnd() < 0.72 ? 0 : 1;
        gyri.push([x, y, z]);
      } else if (rnd() < 0.3) c = 2;
    } else if (rnd() < 0.03) c = 3;
    if (c < 0) continue;
    pts.push({
      x,
      y,
      z,
      c,
      size: c <= 1 ? 1.1 + rnd() * 0.9 : 0.8 + rnd() * 0.6,
      // Ruptura con el scroll: cuanto se aleja del centro y hacia la camara.
      burst: 0.6 + rnd() * 2.4,
      ez: -0.4 + rnd() * 2.2,
    });
  }

  // Sinapsis: nodos sobre las circunvoluciones unidos por arcos.
  const nodeCount = small ? 16 : 28;
  const nodes = Array.from({ length: nodeCount }, () => gyri[Math.floor(rnd() * gyri.length)]);
  const arcs = [];
  for (let i = 0; i < nodes.length; i += 1) {
    const links = rnd() < 0.5 ? 1 : 2;
    for (let k = 0; k < links; k += 1) {
      const j = Math.floor(rnd() * nodes.length);
      if (j === i) continue;
      const a = nodes[i];
      const b = nodes[j];
      const ang = Math.acos(Math.min(Math.max(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1), 1));
      if (ang < 0.35 || ang > 1.9) continue;
      arcs.push({
        a,
        b,
        ang,
        lift: 0.06 + ang * 0.1,
        speed: 0.12 + rnd() * 0.18,
        phase: rnd(),
        color: rnd() < 0.55 ? 0 : rnd() < 0.5 ? 4 : 5,
      });
    }
  }
  return { pts, nodes, arcs };
}

/** Punto del arco entre a y b (interpolacion esferica elevada sobre la superficie). */
function arcPoint(arc, t) {
  const { a, b, ang } = arc;
  const s = Math.sin(ang);
  const ka = Math.sin((1 - t) * ang) / s;
  const kb = Math.sin(t * ang) / s;
  const h = 1 + arc.lift * Math.sin(Math.PI * t);
  return [(a[0] * ka + b[0] * kb) * h, (a[1] * ka + b[1] * kb) * h, (a[2] * ka + b[2] * kb) * h];
}

/**
 * Planeta Tierra-cerebro de particulas en <canvas> (solo web).
 * - Continentes reales (contorno de costa) rellenos de circunvoluciones,
 *   oceanos tenues y atmosfera
 *   con brillo en el borde. Late como un corazon y gira despacio.
 * - Sinapsis: arcos entre nodos por los que viajan pulsos de luz.
 * - progressRef.current (0..1): avance del scroll; acerca la camara y rompe
 *   el planeta en 3D (las particulas salen hacia la camara), como en Astra.
 * - hoverRef.current ('left' | 'right' | null): tine la atmosfera con el
 *   color de la palabra que el usuario esta senalando.
 * Interaccion: se inclina hacia el puntero; sobre el planeta gira mas rapido
 * y resalta las rutas; las particulas se apartan del cursor y un clic lanza
 * un pulso.
 */
export default function BrainGlobeCanvas({ progressRef, hoverRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 700;
    const { pts, nodes, arcs } = buildGlobe(small);
    const rnd = seeded(23);
    const TAU = Math.PI * 2;

    // Estilos por color y nivel de profundidad (se asignan pocas veces por frame).
    const styles = PALETTE.map(([R, G, B]) => DEPTH_ALPHA.map((A) => `rgba(${R},${G},${B},${A})`));
    const buckets = PALETTE.map(() => DEPTH_ALPHA.map(() => []));

    // Estrellas de fondo (fijas, titilan).
    const bg = Array.from({ length: small ? 140 : 280 }, () => ({
      x: rnd(),
      y: rnd(),
      s: rnd() < 0.9 ? 0.8 : 1.6,
      ph: rnd() * Math.PI * 2,
    }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Puntero (normalizado -1..1) y posicion en px dentro del canvas.
    const mouse = { nx: 0, ny: 0, x: -9999, y: -9999, tx: 0, ty: 0, inside: false };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      mouse.x = x;
      mouse.y = y;
      mouse.tx = mouse.inside ? (x / rect.width) * 2 - 1 : 0;
      mouse.ty = mouse.inside ? (y / rect.height) * 2 - 1 : 0;
    };
    let pulse = 0;
    const onDown = (e) => {
      onMove(e);
      if (mouse.inside) pulse = 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });

    // Pausa cuando no se ve.
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    let rot = 0;
    let hot = 0; // 0..1: puntero sobre el planeta (suavizado)
    let glow = { r: 150, g: 120, b: 170, a: 0.16 };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const p = Math.min(Math.max(progressRef?.current || 0, 0), 1);
      const hover = hoverRef?.current || null;

      // Suavizado del puntero y del pulso.
      mouse.nx += (mouse.tx - mouse.nx) * 0.06;
      mouse.ny += (mouse.ty - mouse.ny) * 0.06;
      pulse *= 0.94;

      // Latido "lub-dub" (~55 lpm) que hace respirar al planeta.
      const ph = (now / 1100) % 1;
      const beat = reduce
        ? 0
        : Math.exp(-(((ph - 0.08) / 0.045) ** 2)) + 0.55 * Math.exp(-(((ph - 0.26) / 0.05) ** 2));

      // Ruptura (0..1): con el scroll el planeta se deshace en 3D, como en Astra.
      const t = Math.min(Math.max((p - 0.08) / 0.6, 0), 1);
      const brk = t * t * (3 - 2 * t);

      const Rbase = Math.min(w, h) * (w < 700 ? 0.36 : 0.31);
      const R = Rbase * (1 + p * 0.35 + pulse * 0.04) * (1 + beat * 0.012);
      const cx = w / 2 + mouse.nx * 18;
      const cy = h * 0.5 + mouse.ny * 12;

      // Puntero sobre el planeta: gira mas rapido y resalta las rutas.
      const over =
        mouse.inside && brk < 0.5 && (mouse.x - cx) ** 2 + (mouse.y - cy) ** 2 < R * R ? 1 : 0;
      hot += (over - hot) * 0.08;

      const speed = reduce ? 0.02 : 0.12 + hot * 0.3 + p * 0.25 + pulse * 0.9;
      rot += dt * speed;

      // Orientacion: giro de oeste a este (como la Tierra) desde America +
      // inclinacion hacia el puntero.
      const yaw = START_LON - Math.PI / 2 - rot + mouse.nx * 0.3;
      const tilt = TILT + mouse.ny * 0.15;
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const D = 3.2; // distancia de la camara (en radios) para la perspectiva
      // Proyecta un punto de la esfera; devuelve [x, y, profundidad, escala] o null.
      const proj = (x, y, z, out) => {
        const x1 = x * cyw - z * syw;
        const z1 = x * syw + z * cyw;
        const y2 = y * ct - z1 * st;
        const z2 = y * st + z1 * ct;
        if (z2 > D - 0.25) return null;
        const k = D / (D - z2);
        out[0] = cx + x1 * R * k;
        out[1] = cy + y2 * R * k;
        out[2] = z2;
        out[3] = k;
        return out;
      };
      const tmp = [0, 0, 0, 0];

      // Fondo con estela ligera.
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(12,14,20,0.6)';
      ctx.fillRect(0, 0, w, h);

      // Estrellas de fondo.
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < bg.length; i += 1) {
        const s = bg[i];
        ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(now / 900 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * w - mouse.nx * 6, s.y * h - mouse.ny * 6, s.s * 0.6, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const body = 1 - brk; // cuerpo del planeta (se apaga al romperse)

      // Cuerpo translucido del planeta (efecto holograma con volumen).
      if (body > 0.01) {
        const sph = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
        sph.addColorStop(0, `rgba(40,48,72,${0.55 * body})`);
        sph.addColorStop(1, `rgba(16,19,30,${0.75 * body})`);
        ctx.fillStyle = sph;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'lighter';

      // Atmosfera: brillo en el borde (tipo Fresnel), tenida segun la palabra senalada.
      const target =
        hover === 'left'
          ? { r: 157, g: 107, b: 153, a: 0.32 }
          : hover === 'right'
            ? { r: 112, g: 136, b: 179, a: 0.32 }
            : { r: 130, g: 140, b: 190, a: 0.18 };
      glow = {
        r: glow.r + (target.r - glow.r) * 0.08,
        g: glow.g + (target.g - glow.g) * 0.08,
        b: glow.b + (target.b - glow.b) * 0.08,
        a: glow.a + (target.a - glow.a) * 0.08,
      };
      if (body > 0.01) {
        const ga = (glow.a + beat * 0.08 + hot * 0.06) * body;
        const atm = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.3);
        const col = `${glow.r | 0},${glow.g | 0},${glow.b | 0}`;
        atm.addColorStop(0, `rgba(${col},0)`);
        atm.addColorStop(0.42, `rgba(${col},${ga})`);
        atm.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = atm;
        ctx.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
      }

      // Particulas agrupadas por color y profundidad.
      for (let c = 0; c < buckets.length; c += 1) {
        for (let l = 0; l < DEPTH_ALPHA.length; l += 1) buckets[c][l].length = 0;
      }
      const RM = 90;
      const RM2 = RM * RM;
      for (let i = 0; i < pts.length; i += 1) {
        const q = pts[i];
        const e = 1 + brk * q.burst;
        const x1 = q.x * e * cyw - q.z * e * syw;
        const z1 = q.x * e * syw + q.z * e * cyw;
        const y2 = q.y * e * ct - z1 * st;
        const z2 = q.y * e * st + z1 * ct + brk * q.ez;
        if (z2 > D - 0.25) continue; // ya paso junto a la camara
        const k = D / (D - z2);
        let px = cx + x1 * R * k;
        let py = cy + y2 * R * k;
        if (mouse.inside) {
          const dx = px - mouse.x;
          const dy = py - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < RM2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / RM) * 18;
            px += (dx / d) * f;
            py += (dy / d) * f;
          }
        }
        // Profundidad relativa al planeta: cara visible, borde u oculta.
        const zn = z2 / e;
        const level = zn > 0.25 ? 2 : zn > -0.2 ? 1 : 0;
        buckets[q.c][level].push(px, py, q.size * 0.6 * Math.min(k, 4));
      }
      ctx.globalAlpha = 1 - brk * 0.75;
      for (let c = 0; c < buckets.length; c += 1) {
        for (let l = 0; l < DEPTH_ALPHA.length; l += 1) {
          const b = buckets[c][l];
          if (!b.length) continue;
          ctx.fillStyle = styles[c][l];
          ctx.beginPath();
          for (let j = 0; j < b.length; j += 3) {
            ctx.moveTo(b[j] + b[j + 2], b[j + 1]);
            ctx.arc(b[j], b[j + 1], b[j + 2], 0, TAU);
          }
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Sinapsis: rutas, pulsos viajeros y nodos (se apagan al romperse).
      if (body > 0.02) drawSynapses(now, proj, tmp, body, beat);
    };

    const SEG = 22;
    const drawSynapses = (now, proj, tmp, body, beat) => {
      const routeA = (0.1 + hot * 0.22) * body;
      ctx.lineWidth = 1;
      for (let i = 0; i < arcs.length; i += 1) {
        const arc = arcs[i];
        // Ruta: solo la parte visible (frente) con brillo segun profundidad.
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= SEG; s += 1) {
          const [x, y, z] = arcPoint(arc, s / SEG);
          const pr = proj(x, y, z, tmp);
          if (!pr || pr[2] < -0.15) {
            started = false;
            continue;
          }
          if (started) ctx.lineTo(pr[0], pr[1]);
          else ctx.moveTo(pr[0], pr[1]);
          started = true;
        }
        const [R0, G0, B0] = PALETTE[arc.color];
        ctx.strokeStyle = `rgba(${R0},${G0},${B0},${routeA})`;
        ctx.stroke();

        // Pulso: cabeza brillante con estela corta.
        const tp = reduce ? arc.phase : (now / 1000) * arc.speed * (1 + hot) + arc.phase;
        const tt = tp % 1;
        for (let k = 0; k < 6; k += 1) {
          const tk = tt - k * 0.018;
          if (tk < 0) break;
          const [x, y, z] = arcPoint(arc, tk);
          const pr = proj(x, y, z, tmp);
          if (!pr || pr[2] < -0.1) continue;
          const a = (1 - k / 6) * (0.9 * body);
          ctx.fillStyle = `rgba(${R0},${G0},${B0},${a})`;
          ctx.beginPath();
          ctx.arc(pr[0], pr[1], (k === 0 ? 2.2 : 1.4) * pr[3], 0, TAU);
          ctx.fill();
        }
      }

      // Nodos: laten con el corazon del planeta.
      for (let i = 0; i < nodes.length; i += 1) {
        const n = nodes[i];
        const pr = proj(n[0] * 1.01, n[1] * 1.01, n[2] * 1.01, tmp);
        if (!pr || pr[2] < -0.05) continue;
        const r = (1.6 + beat * 0.8) * pr[3];
        const halo = ctx.createRadialGradient(pr[0], pr[1], 0, pr[0], pr[1], r * 5);
        halo.addColorStop(0, `rgba(232,198,142,${0.45 * body})`);
        halo.addColorStop(1, 'rgba(232,198,142,0)');
        ctx.fillStyle = halo;
        ctx.fillRect(pr[0] - r * 5, pr[1] - r * 5, r * 10, r * 10);
        ctx.fillStyle = `rgba(255,244,222,${0.9 * body})`;
        ctx.beginPath();
        ctx.arc(pr[0], pr[1], r, 0, TAU);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [progressRef, hoverRef]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#0c0e14',
      }}
    />
  );
}
