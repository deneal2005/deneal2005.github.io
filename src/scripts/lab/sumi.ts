import { fitCanvas } from './canvas';

/**
 * 墨 Sumi — a brush that responds to speed (and pen pressure where available).
 * Slow strokes are wet and heavy with a soft bleed; fast ones split into dry bristles.
 */
const PAPER = '#0e1112';
const INK = '232, 225, 210';

export function mount(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas');
  const hint = root.querySelector<HTMLElement>('[data-sumi-hint]');
  if (!canvas) return;

  let snapshot: HTMLCanvasElement | null = null;
  const { ctx } = fitCanvas(canvas, (w, h) => {
    paper(w, h);
    if (snapshot) ctx.drawImage(snapshot, 0, 0, w, h);
  });

  function paper(w = canvas!.clientWidth, h = canvas!.clientHeight) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
    // fibres
    ctx.strokeStyle = 'rgba(232, 225, 210, 0.035)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < (w * h) / 900; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = Math.random() * Math.PI;
      const l = 2 + Math.random() * 7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      ctx.stroke();
    }
  }

  type Point = { x: number; y: number; t: number; w: number };
  let last: Point | null = null;
  const MAX = 15;

  const widthFor = (speed: number, pressure: number) => {
    const base = MAX * (pressure > 0 && pressure !== 0.5 ? 0.4 + pressure : 1);
    return Math.max(1.1, base / (1 + speed * 3.2));
  };

  const segment = (a: Point, b: Point) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const dry = b.w < MAX * 0.35;

    if (dry) {
      // Fast: the brush runs out of ink and splits into bristles.
      const bristles = 6;
      for (let i = 0; i < bristles; i++) {
        if (Math.random() < 0.28) continue;
        const o = (i / (bristles - 1) - 0.5) * b.w * 1.6;
        ctx.strokeStyle = `rgba(${INK}, ${0.45 + Math.random() * 0.4})`;
        ctx.lineWidth = Math.max(0.6, b.w * 0.3);
        ctx.beginPath();
        ctx.moveTo(a.x + nx * o, a.y + ny * o);
        ctx.lineTo(b.x + nx * o, b.y + ny * o);
        ctx.stroke();
      }
      return;
    }

    // Slow: a soft bleed into the fibres, then the body of the stroke.
    ctx.strokeStyle = `rgba(${INK}, 0.06)`;
    ctx.lineWidth = b.w * 1.9;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${INK}, 0.92)`;
    const steps = Math.max(1, Math.ceil(len / 2));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      ctx.lineWidth = a.w + (b.w - a.w) * t;
      ctx.beginPath();
      ctx.moveTo(a.x + dx * ((i - 1) / steps), a.y + dy * ((i - 1) / steps));
      ctx.lineTo(a.x + dx * t, a.y + dy * t);
      ctx.stroke();
    }
  };

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pointFrom = (e: PointerEvent, prev: Point | null): Point => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const t = e.timeStamp;
    if (!prev) return { x, y, t, w: widthFor(0, e.pressure) * 0.6 };
    const speed = Math.hypot(x - prev.x, y - prev.y) / Math.max(1, t - prev.t);
    const target = widthFor(speed, e.pressure);
    return { x, y, t, w: prev.w + (target - prev.w) * 0.3 };
  };

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    ctx.lineCap = 'round';
    last = pointFrom(e, null);
    hint?.classList.add('is-hidden');
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!last) return;
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const next = pointFrom(ev, last);
      segment(last, next);
      last = next;
    }
  });

  const lift = () => {
    if (!last) return;
    last = null;
    snapshot = document.createElement('canvas');
    snapshot.width = canvas.width;
    snapshot.height = canvas.height;
    snapshot.getContext('2d')?.drawImage(canvas, 0, 0);
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);

  root.querySelector('[data-sumi-clear]')?.addEventListener('click', () => {
    snapshot = null;
    paper();
    hint?.classList.remove('is-hidden');
  });
}
