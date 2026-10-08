// Renders public/apple-touch-icon.png and public/favicon.ico from the insignia (src/components/ui/Insignia.astro).
// Usage: npm run icons
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const insignia = '<rect x="1" y="1" width="22" height="22" rx="1" fill="#b3231c"/><rect x="3" y="3" width="18" height="18" fill="none" stroke="#ebe5d8" stroke-width=".6" opacity=".45"/><path fill="#ebe5d8" d="M5 19v-6h2v-1.6h2V13h2v-1.6h2V13h2v-1.6h2V13h2v6z"/><path fill="#ebe5d8" d="M12 4.2l.9 1.6v8.4h-1.8V5.8z M9.6 14.2h4.8v1.1H9.6z"/>';

const touch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#0c0b0a"/>
  <g transform="translate(18 18) scale(6)">${insignia}</g>
</svg>`;
await sharp(Buffer.from(touch)).png().toFile('public/apple-touch-icon.png');
console.log('public/apple-touch-icon.png');

// A 32px PNG wrapped in a minimal ICO container (PNG-in-ICO is supported everywhere that matters).
const png = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">${insignia}</svg>`)).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([header, png]));
console.log('public/favicon.ico');
