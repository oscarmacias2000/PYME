import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

// Tipos de trabajo manual y en que se convierten al pasar por la IA.
// Colores: paleta tenue de la marca ("Malva y pizarra") + acentos suaves.
const TYPES = [
  { icon: 'mail-outline', from: 'Correo de cliente', to: 'Clasificado por IA → CRM', rgb: '140,165,210' },
  { icon: 'logo-whatsapp', from: 'Mensaje de WhatsApp', to: 'Respondido por el chatbot', rgb: '150,206,180' },
  { icon: 'receipt-outline', from: 'Factura en papel', to: 'Registrada en el ERP', rgb: '232,198,142' },
  { icon: 'grid-outline', from: 'Hoja de Excel', to: 'Reporte generado', rgb: '196,152,194' },
  { icon: 'chatbubbles-outline', from: 'Ticket de soporte', to: 'Asignado y resuelto', rgb: '170,190,225' },
];
const GLYPH = (name) => String.fromCodePoint(Ionicons.glyphMap[name]);
const CHECK = GLYPH('checkmark');
const SPARK = GLYPH('sparkles');
const PENDING = '232,176,120'; // punto "pendiente" (ambar)

// Simbolo de BuildWise Labs para el centro del nucleo.
const MARK = require('../../../assets/buildwise-mark.png');
const MARK_URI = typeof MARK === 'string' ? MARK : MARK?.uri || MARK?.default || '';

// Generador pseudoaleatorio con semilla (misma escena en cada carga).
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Hero "del caos al orden" en <canvas> (solo web).
 * - Al cargar: decenas de tareas manuales (correos, WhatsApp, facturas, Excel,
 *   tickets) flotan en desorden alrededor de un nucleo de IA (el simbolo de
 *   BuildWise) que late; de vez
 *   en cuando una tarea viaja al nucleo y sale resuelta.
 * - progressRef.current (0..1): avance del scroll; el nucleo absorbe cada
 *   tarea y la devuelve ordenada en orbitas 3D, con su color y una palomita.
 * - hoverRef.current ('left' | 'right' | null): tine el nucleo con el color de
 *   la palabra que el usuario esta senalando.
 * Interaccion: al senalar una tarea se ve su etiqueta (antes -> despues);
 * las tareas se apartan del cursor y un clic en el nucleo procesa una tanda.
 */
export default function AutomationCanvas({ progressRef, hoverRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TAU = Math.PI * 2;
    const rnd = seeded(31);

    // Logotipo (mientras carga se muestra la chispa).
    let mark = null;
    if (MARK_URI) {
      const img = new window.Image();
      img.onload = () => {
        mark = img;
      };
      img.src = MARK_URI;
    }

    let w = 0;
    let h = 0;
    let small = false;
    let items = [];
    const RINGS = 3;

    // Posiciones "caoticas": por toda la pantalla, lejos del nucleo y del texto.
    const layout = () => {
      small = w < 700;
      const N = small ? 24 : 44;
      const r = seeded(7);
      const perRing = Math.ceil(N / RINGS);
      items = Array.from({ length: N }, (_, i) => {
        let x;
        let y;
        for (let tries = 0; tries < 40; tries += 1) {
          x = 0.05 + r() * 0.9;
          y = 0.1 + r() * 0.82;
          const dx = (x - 0.5) / 0.26;
          const dy = (y - 0.47) / 0.24;
          const inWords = Math.abs(y - 0.5) < 0.07; // franja de "BuildWise ... Labs"
          if (dx * dx + dy * dy > 1 && !inWords) break;
        }
        return {
          type: Math.floor(r() * TYPES.length),
          bx: x,
          by: y,
          ph: r() * TAU,
          f1: 0.25 + r() * 0.35,
          f2: 0.2 + r() * 0.3,
          rot: (r() - 0.5) * 0.5,
          // Momento del scroll en que el nucleo la procesa (escalonado).
          t0: 0.06 + (i / N) * 0.5 + r() * 0.04,
          ring: i % RINGS,
          slot: Math.floor(i / RINGS),
          perRing,
          sx: 0,
          sy: 0,
          depth: 0,
        };
      });
    };

    let dpr = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Estrellas de fondo (fijas, titilan).
    const bg = Array.from({ length: 220 }, () => ({
      x: rnd(),
      y: rnd(),
      s: rnd() < 0.9 ? 0.8 : 1.6,
      ph: rnd() * TAU,
    }));

    // Puntero.
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
    // Clic en el nucleo: procesa una tanda de tareas de demostracion.
    let flash = 0;
    let core = { x: 0, y: 0, r: 0 };
    const demos = [];
    let done = 0; // tareas automatizadas en esta visita (contador)
    const spawnDemo = (now) => {
      const side = rnd() * TAU;
      demos.push({
        type: Math.floor(rnd() * TYPES.length),
        x0: 0.5 + Math.cos(side) * 0.55,
        y0: 0.47 + Math.sin(side) * 0.5,
        start: now,
        dur: 2400 + rnd() * 900,
        out: rnd() * TAU,
      });
    };
    const onDown = (e) => {
      onMove(e);
      if ((mouse.x - core.x) ** 2 + (mouse.y - core.y) ** 2 < (core.r * 1.6) ** 2) {
        flash = 1;
        const now = performance.now();
        for (let k = 0; k < 6; k += 1) spawnDemo(now - k * 180);
      }
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
    let clock = 0;
    let nextDemo = 0;
    let tint = { r: 157, g: 107, b: 153 };

    // Posicion en la orbita 3D (elipse inclinada) de una tarea ordenada.
    const orbit = (it, t) => {
      const j = it.ring;
      const a = Math.min(core.r * (4.6 + j * 2.4), w * (small ? 0.46 : 0.42));
      const b = a * 0.24;
      const roll = -0.16 + j * 0.16;
      const om = reduce ? 0 : 0.22 - j * 0.05;
      const th = (it.slot / it.perRing) * TAU + j * 0.7 + t * om;
      const ex = Math.cos(th) * a;
      const ey = Math.sin(th) * b;
      return {
        x: core.x + ex * Math.cos(roll) - ey * Math.sin(roll),
        y: core.y + ex * Math.sin(roll) + ey * Math.cos(roll),
        depth: Math.sin(th), // >0: delante del nucleo
        a,
        b,
        roll,
      };
    };

    // Tarjeta de una tarea: fondo, borde, icono y estado (pendiente / listo).
    const drawCard = (x, y, size, type, order, alpha, angle) => {
      const T = TYPES[type];
      const gray = '120,126,142';
      const rgb = order > 0.5 ? T.rgb : gray;
      ctx.save();
      ctx.translate(x, y);
      if (angle) ctx.rotate(angle * (1 - order));
      ctx.globalAlpha = alpha;
      const s = size;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.28);
      else ctx.rect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = 'rgba(21,24,36,0.92)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${rgb},${0.35 + order * 0.45})`;
      ctx.stroke();
      if (order > 0.5) {
        ctx.shadowColor = `rgba(${T.rgb},0.6)`;
        ctx.shadowBlur = 12;
      }
      ctx.fillStyle = `rgba(${rgb},${0.7 + order * 0.3})`;
      ctx.font = `${Math.round(s * 0.52)}px ionicons`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(GLYPH(T.icon), 0, 1);
      ctx.shadowBlur = 0;
      // Estado: punto ambar (pendiente) o palomita verde (automatizado).
      const bx = s / 2 - 1;
      const by = -s / 2 + 1;
      if (order > 0.5) {
        ctx.fillStyle = 'rgba(120,200,160,0.95)';
        ctx.beginPath();
        ctx.arc(bx, by, s * 0.2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#0c0e14';
        ctx.font = `${Math.round(s * 0.26)}px ionicons`;
        ctx.fillText(CHECK, bx, by + 0.5);
      } else {
        ctx.fillStyle = `rgba(${PENDING},0.9)`;
        ctx.beginPath();
        ctx.arc(bx, by, s * 0.1, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;

      const p = clamp01(progressRef?.current || 0);
      const hover = hoverRef?.current || null;
      mouse.nx += (mouse.tx - mouse.nx) * 0.06;
      mouse.ny += (mouse.ty - mouse.ny) * 0.06;
      flash *= 0.93;

      // Latido del nucleo.
      const ph = (now / 1100) % 1;
      const beat = reduce
        ? 0
        : Math.exp(-(((ph - 0.08) / 0.045) ** 2)) + 0.55 * Math.exp(-(((ph - 0.26) / 0.05) ** 2));

      // Nucleo: sube un poco al formarse el logotipo (queda encima del texto).
      const k = clamp01(p / 0.7);
      core = {
        x: w / 2 + mouse.nx * 10,
        y: h * (0.47 - 0.15 * ease(k)) + mouse.ny * 8,
        r: Math.min(w, h) * (small ? 0.075 : 0.065) * (1 + beat * 0.04 + flash * 0.15),
      };
      const card = small ? 24 : 30;

      // Fondo.
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0c0e14';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < bg.length; i += 1) {
        const s = bg[i];
        ctx.globalAlpha = 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(now / 900 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * w - mouse.nx * 6, s.y * h - mouse.ny * 6, s.s * 0.6, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Estado de cada tarea: caos -> nucleo -> orbita (reversible con el scroll).
      let ordered = 0;
      let inCore = 0;
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const lp = clamp01((p - it.t0) / 0.16);
        // Caos: deriva lenta alrededor de su posicion base.
        const drift = reduce ? 0 : 1;
        let cx = it.bx * w + Math.sin(clock * it.f1 + it.ph) * 14 * drift;
        let cy = it.by * h + Math.cos(clock * it.f2 + it.ph) * 12 * drift;
        // Se apartan del cursor mientras estan en desorden.
        if (mouse.inside && lp === 0) {
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 110 * 110 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            cx += (dx / d) * (1 - d / 110) * 30;
            cy += (dy / d) * (1 - d / 110) * 30;
          }
        }
        const o = orbit(it, clock);
        if (lp < 0.45) {
          const q = ease(lp / 0.45);
          it.sx = lerp(cx, core.x, q);
          it.sy = lerp(cy, core.y, q);
          it.scale = 1 - q * 0.6;
          it.order = 0;
          it.depth = 1;
        } else if (lp < 0.55) {
          it.sx = core.x;
          it.sy = core.y;
          it.scale = 0;
          it.order = 0;
          inCore += 1;
        } else {
          const q = ease((lp - 0.55) / 0.45);
          it.sx = lerp(core.x, o.x, q);
          it.sy = lerp(core.y, o.y, q);
          it.scale = (0.4 + q * 0.6) * (0.82 + 0.18 * o.depth);
          it.order = 1;
          it.depth = o.depth;
        }
        if (lp >= 1) ordered += 1;
      }

      // Tareas de demostracion (solo con poco scroll): viajan al nucleo y salen listas.
      if (!reduce && p < 0.12 && now > nextDemo) {
        spawnDemo(now);
        nextDemo = now + 1300 + rnd() * 900;
      }

      // Orbitas (se revelan con el scroll).
      const reveal = clamp01((p - 0.2) / 0.4);
      if (reveal > 0.01) {
        for (let j = 0; j < RINGS; j += 1) {
          const o = orbit({ ring: j, slot: 0, perRing: 1 }, 0);
          ctx.save();
          ctx.translate(core.x, core.y);
          ctx.rotate(o.roll);
          ctx.strokeStyle = `rgba(147,164,194,${0.16 * reveal})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 7]);
          ctx.lineDashOffset = reduce ? 0 : -clock * 8;
          ctx.beginPath();
          ctx.ellipse(0, 0, o.a, o.b, 0, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
        ctx.setLineDash([]);
      }

      // Lineas de flujo de las tareas en transito hacia/desde el nucleo.
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        const lp = clamp01((p - it.t0) / 0.16);
        if (lp <= 0 || lp >= 1) continue;
        const rgb = it.order ? TYPES[it.type].rgb : '150,160,190';
        ctx.strokeStyle = `rgba(${rgb},0.35)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(it.sx, it.sy);
        ctx.lineTo(core.x, core.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      // Tareas ordenadas detras del nucleo.
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        if (it.order && it.depth < 0 && it.scale > 0) {
          drawCard(it.sx, it.sy, card * it.scale, it.type, 1, 0.55 + 0.45 * (1 + it.depth), 0);
        }
      }

      // Nucleo de IA: resplandor, anillos, esfera y chispa.
      const tr = hover === 'right' ? [112, 136, 179] : [157, 107, 153];
      tint = {
        r: lerp(tint.r, tr[0], 0.08),
        g: lerp(tint.g, tr[1], 0.08),
        b: lerp(tint.b, tr[2], 0.08),
      };
      const tc = `${tint.r | 0},${tint.g | 0},${tint.b | 0}`;
      const heat = clamp01(inCore * 0.35 + flash + beat * 0.3);
      ctx.globalCompositeOperation = 'lighter';
      const glowR = core.r * (3.2 + heat * 0.8);
      const g1 = ctx.createRadialGradient(core.x, core.y, core.r * 0.6, core.x, core.y, glowR);
      g1.addColorStop(0, `rgba(${tc},${0.32 + heat * 0.25})`);
      g1.addColorStop(1, `rgba(${tc},0)`);
      ctx.fillStyle = g1;
      ctx.fillRect(core.x - glowR, core.y - glowR, glowR * 2, glowR * 2);
      ctx.globalCompositeOperation = 'source-over';

      for (let j = 0; j < 3; j += 1) {
        ctx.save();
        ctx.translate(core.x, core.y);
        ctx.rotate((reduce ? 0 : clock * (0.5 - j * 0.22)) + j);
        ctx.strokeStyle = `rgba(${j === 1 ? '147,164,194' : tc},${0.55 - j * 0.12})`;
        ctx.lineWidth = j === 0 ? 1.6 : 1;
        ctx.setLineDash(j === 2 ? [2, 5] : [core.r * 0.9, core.r * 0.5]);
        ctx.beginPath();
        ctx.arc(0, 0, core.r * (1.3 + j * 0.28), 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);

      // Disco oscuro detras del simbolo para que resalte sobre el resplandor.
      const orb = ctx.createRadialGradient(core.x, core.y, core.r * 0.2, core.x, core.y, core.r * 1.1);
      orb.addColorStop(0, 'rgba(28,32,50,0.95)');
      orb.addColorStop(1, 'rgba(14,16,26,0.9)');
      ctx.fillStyle = orb;
      ctx.beginPath();
      ctx.arc(core.x, core.y, core.r * 1.1, 0, TAU);
      ctx.fill();
      if (mark) {
        // Simbolo de la marca: late con el nucleo y brilla al procesar tareas.
        const ms = core.r * 1.75;
        ctx.save();
        ctx.shadowColor = `rgba(${tc},${0.5 + heat * 0.4})`;
        ctx.shadowBlur = 14 + heat * 16;
        ctx.drawImage(mark, core.x - ms / 2, core.y - ms / 2, ms, ms);
        ctx.restore();
      } else {
        ctx.fillStyle = `rgba(255,255,255,${0.85 + heat * 0.15})`;
        ctx.font = `${Math.round(core.r * 0.95)}px ionicons`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(SPARK, core.x, core.y + 1);
      }

      // Tareas: en desorden, entrando/saliendo del nucleo y ordenadas delante.
      for (let i = 0; i < items.length; i += 1) {
        const it = items[i];
        if (it.scale <= 0 || (it.order && it.depth < 0)) continue;
        drawCard(it.sx, it.sy, card * it.scale, it.type, it.order, 1, it.order ? 0 : it.rot);
      }

      // Demos: arco hacia el nucleo y salida con palomita.
      for (let d = demos.length - 1; d >= 0; d -= 1) {
        const dm = demos[d];
        const t = (now - dm.start) / dm.dur;
        if (t < 0) continue;
        if (t >= 1) {
          demos.splice(d, 1);
          done += 1;
          continue;
        }
        let x;
        let y;
        let order = 0;
        let a = 1;
        if (t < 0.5) {
          const q = ease(t / 0.5);
          x = lerp(dm.x0 * w, core.x, q);
          y = lerp(dm.y0 * h, core.y, q);
          a = clamp01(t * 6) * (1 - q * 0.3);
        } else {
          const q = ease((t - 0.5) / 0.5);
          const dist = core.r * (2 + q * 4);
          x = core.x + Math.cos(dm.out) * dist;
          y = core.y + Math.sin(dm.out) * dist * 0.6;
          order = 1;
          a = 1 - q;
        }
        drawCard(x, y, card * 0.8, dm.type, order, a, 0);
      }

      // Contador sobre el nucleo.
      const total = ordered + done;
      if (total > 0) {
        ctx.fillStyle = 'rgba(200,206,222,0.75)';
        ctx.font = '12px "IBM Plex Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const label = `${total} ${total === 1 ? 'tarea automatizada' : 'tareas automatizadas'}`;
        // Encima de la orbita exterior para no tapar tarjetas.
        const top = orbit({ ring: RINGS - 1, slot: 0, perRing: 1 }, 0);
        ctx.fillText(label, core.x, core.y - Math.max(core.r * 2.1, top.b + card));
      }

      // Etiqueta de la tarea senalada (antes -> despues).
      if (mouse.inside) {
        let best = -1;
        let bd = (card * 0.8) ** 2;
        for (let i = 0; i < items.length; i += 1) {
          const it = items[i];
          if (it.scale <= 0) continue;
          const d2 = (it.sx - mouse.x) ** 2 + (it.sy - mouse.y) ** 2;
          if (d2 < bd) {
            bd = d2;
            best = i;
          }
        }
        if (best >= 0) {
          const it = items[best];
          const T = TYPES[it.type];
          const txt = it.order ? `${T.from} → ${T.to}` : `${T.from} · pendiente`;
          ctx.font = '12px "IBM Plex Sans", sans-serif';
          const tw = ctx.measureText(txt).width + 20;
          const tx = Math.min(Math.max(it.sx - tw / 2, 8), w - tw - 8);
          const ty = it.sy - card * 0.9 - 26;
          ctx.fillStyle = 'rgba(21,24,36,0.95)';
          ctx.strokeStyle = `rgba(${it.order ? T.rgb : '120,126,142'},0.6)`;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(tx, ty, tw, 24, 12);
          else ctx.rect(tx, ty, tw, 24);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(230,234,244,0.95)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(txt, tx + 10, ty + 12.5);
        }
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
