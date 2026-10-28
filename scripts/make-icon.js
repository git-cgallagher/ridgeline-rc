// Run with Electron (npm run build:icon). Draws the app icon, a red RC truck on a dirt track, and writes:
//   build/icon.iconset/*.png (for iconutil → build/icon.icns) and build/icon.ico (PNG-in-ICO for Windows).
const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

// 16x16 pixel art: a red RC truck seen from above on a dirt track with a checkered strip.
function art() {
  const r = rng(5), px = [];
  const dirt = ['#a8794b', '#97683c', '#b3855a'];
  for (let y = 0; y < 16; y++) { px.push([]); for (let x = 0; x < 16; x++) px[y].push(hex(dirt[Math.floor(r() * dirt.length)])); }
  for (let y = 0; y < 16; y++) for (let x = 0; x < 2; x++) px[y][x] = hex((Math.floor(y / 2) + x) % 2 ? '#111111' : '#f5f5f5');
  const M = {
    'k': '#121216', 'r': '#e2412f', 'R': '#ff7a5c', 'd': '#8f2418', 'y': '#ffd34d', 'w': '#1a2230', 'g': '#a0d2ff',
  };
  const truck = [
    '..kkk....kkk..',
    '..kkk....kkk..',
    '.dRRRRRRRRRRr.',
    'ddRRRRRRRRRrrd',
    'drrwwggrryyyrd',
    'drrwwggrryyyrd',
    'drrwwggrrrrrrd',
    'ddrrrrrrrrrrrd',
    '.drrrrrrrrrrr.',
    '..kkk....kkk..',
    '..kkk....kkk..',
  ];
  truck.forEach((row, j) => [...row].forEach((c, i) => { if (M[c]) px[3 + j][2 + i] = hex(M[c]); }));
  return px;
}

function render(px, size) {
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const [R, G, B] = px[Math.floor(y * 16 / size)][Math.floor(x * 16 / size)], o = (y * size + x) * 4;
    buf[o] = B; buf[o + 1] = G; buf[o + 2] = R; buf[o + 3] = 255;                     // BGRA
  }
  return nativeImage.createFromBitmap(buf, { width: size, height: size }).toPNG();
}

app.whenReady().then(() => {
  const px = art(), dir = path.join(__dirname, '..', 'build'), set = path.join(dir, 'icon.iconset');
  fs.rmSync(set, { recursive: true, force: true });
  fs.mkdirSync(set, { recursive: true });
  for (const s of [16, 32, 128, 256, 512]) {
    fs.writeFileSync(path.join(set, `icon_${s}x${s}.png`), render(px, s));
    fs.writeFileSync(path.join(set, `icon_${s}x${s}@2x.png`), render(px, s * 2));
  }
  fs.writeFileSync(path.join(dir, 'icon.png'), render(px, 1024));
  // ICO with PNG payloads (Windows Vista+): 6-byte header, 16-byte entry per image, then the PNGs.
  const sizes = [16, 32, 48, 256], pngs = sizes.map(s => render(px, s));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    head.writeUInt8(s === 256 ? 0 : s, e); head.writeUInt8(s === 256 ? 0 : s, e + 1);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync(path.join(dir, 'icon.ico'), Buffer.concat([head, ...pngs]));
  console.log('Wrote build/icon.iconset, build/icon.png and build/icon.ico');
  app.quit();
});
