// Renders public/apple-touch-icon.png from the cut-sun mark on paper.
// Usage: npm run icons
import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#ebe4d6"/>
  <g transform="translate(30 30) scale(5)">
    <path fill="#da3b22" d="M4.3 5.9A10 10 0 0 1 20.4 17.1Z"/>
    <path fill="#da3b22" d="M2.9 7.9A10 10 0 0 0 19 19.1Z"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/apple-touch-icon.png');
console.log('public/apple-touch-icon.png');
