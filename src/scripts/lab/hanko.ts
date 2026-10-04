import { fitCanvas, fontFamily } from './canvas';

/**
 * 判 Hanko — carves a seal from up to four characters. Read like a real seal:
 * top to bottom, right column first. The ink loss is seeded by the text, so
 * the same initials always stamp the same way.
 */
const SHU = '#da3b22';
const SIZE = 640;

const seeded = (text: string) => {
  let a = [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 1779033703) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Draws the seal into a square context of side `s`. */
function carve(ctx: CanvasRenderingContext2D, s: number, text: string, family: string) {
  const random = seeded(text || '判');
  const chars = [...(text || '判')];
  ctx.clearRect(0, 0, s, s);
  ctx.save();
  ctx.translate(s / 2, s / 2);
  ctx.rotate((-2.5 * Math.PI) / 180);
  ctx.translate(-s / 2, -s / 2);

  const m = s * 0.12;
  const box = s - m * 2;
  ctx.fillStyle = SHU;
  ctx.strokeStyle = SHU;

  // Border: a heavy outer frame and a fine inner one.
  ctx.lineWidth = s * 0.035;
  ctx.strokeRect(m, m, box, box);
  ctx.lineWidth = s * 0.008;
  const inset = s * 0.045;
  ctx.strokeRect(m + inset, m + inset, box - inset * 2, box - inset * 2);

  // Cells, read right column first, top to bottom.
  const inner = box - inset * 2;
  const origin = m + inset;
  const cells: { x: number; y: number; w: number; h: number }[] =
    chars.length === 1
      ? [{ x: 0, y: 0, w: 1, h: 1 }]
      : chars.length === 2
        ? [
            { x: 0, y: 0, w: 1, h: 0.5 },
            { x: 0, y: 0.5, w: 1, h: 0.5 },
          ]
        : chars.length === 3
          ? [
              { x: 0.5, y: 0, w: 0.5, h: 0.5 },
              { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
              { x: 0, y: 0, w: 0.5, h: 1 },
            ]
          : [
              { x: 0.5, y: 0, w: 0.5, h: 0.5 },
              { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
              { x: 0, y: 0, w: 0.5, h: 0.5 },
              { x: 0, y: 0.5, w: 0.5, h: 0.5 },
            ];

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  chars.slice(0, 4).forEach((char, i) => {
    const c = cells[i];
    const cw = c.w * inner;
    const ch = c.h * inner;
    const size = Math.min(ch * 0.92, cw * 1.25);
    ctx.font = `800 ${size}px ${family}`;
    const metrics = ctx.measureText(char);
    // Seal letters are squeezed to fill their cell, whatever their natural width.
    const sx = Math.min(2, (cw * 0.82) / Math.max(1, metrics.width));
    const sy = (ch * 0.86) / Math.max(1, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    ctx.save();
    ctx.translate(origin + (c.x + c.w / 2) * inner, origin + (c.y + c.h / 2) * inner);
    ctx.scale(sx, sy);
    ctx.fillText(char, 0, (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2);
    ctx.restore();
  });
  ctx.restore();

  // Ink loss: specks, a few dry patches and uneven pressure toward one corner.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.25 + random() * 0.75;
    ctx.beginPath();
    ctx.arc(random() * s, random() * s, random() * s * 0.0035 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 7; i++) {
    const x = m + random() * box;
    const y = m + random() * box;
    const g = ctx.createRadialGradient(x, y, 0, x, y, s * (0.03 + random() * 0.06));
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }
  const corner = ctx.createLinearGradient(0, 0, s, s);
  corner.addColorStop(0, 'rgba(0,0,0,0)');
  corner.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = corner;
  ctx.fillRect(0, 0, s, s);
  ctx.restore();
}

export function mount(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hanko-canvas]');
  const form = root.querySelector<HTMLFormElement>('[data-hanko-form]');
  const input = form?.querySelector<HTMLInputElement>('input');
  if (!canvas || !form || !input) return;

  const family = fontFamily('--font-display', 'Georgia, serif');
  const clean = () => [...input.value.toUpperCase().replace(/\s+/g, '')].slice(0, 4).join('');

  let side = 0;
  const { ctx } = fitCanvas(canvas, (w, h) => {
    side = Math.min(w, h);
    render();
  });

  function render() {
    if (!side) return;
    const { width, height } = canvas!.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate((width - side) / 2, (height - side) / 2);
    carve(ctx, side, clean(), family);
    ctx.restore();
  }

  document.fonts.load(`800 64px ${family}`).finally(render);
  input.addEventListener('input', () => requestAnimationFrame(render));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = clean();
    const out = document.createElement('canvas');
    out.width = SIZE;
    out.height = SIZE;
    const octx = out.getContext('2d');
    if (!octx) return;
    carve(octx, SIZE, text, family);
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hanko-${text || 'seal'}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
}
