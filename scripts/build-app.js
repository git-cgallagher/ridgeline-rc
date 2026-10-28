// Builds app/index.html for the desktop app from the root index.html (the artifact source).
// Wraps the page in a full document, adds a CSP, and swaps Google Fonts for bundled copies so it runs offline.
// Never hand-edit app/: change the root index.html and rebuild.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'app');
const fontsOut = path.join(out, 'fonts');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(fontsOut, { recursive: true });

const FONTS = [
  ['Silkscreen', 400, '@fontsource/silkscreen/files/silkscreen-latin-400-normal.woff2'],
  ['Silkscreen', 700, '@fontsource/silkscreen/files/silkscreen-latin-700-normal.woff2'],
  ['Atkinson Hyperlegible', 400, '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2'],
  ['Atkinson Hyperlegible', 700, '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2'],
];
const faces = FONTS.map(([family, weight, src]) => {
  const file = path.basename(src);
  fs.copyFileSync(require.resolve(src), path.join(fontsOut, file));
  return `@font-face { font-family: "${family}"; font-weight: ${weight}; font-style: normal; font-display: swap; src: url("fonts/${file}") format("woff2"); }`;
}).join('\n');

let page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const before = page.length;
page = page.replace(/<link rel="(?:preconnect|stylesheet)" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?/g, '');
if (page.length === before || /fonts\.googleapis/.test(page)) throw new Error('Google Fonts links not found or not fully removed; update build-app.js');

const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:";
const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<style>
${faces}
body { margin: 0; }
</style>
`;
// The artifact page puts <title>/<style> first and markup after; </head><body> goes before the first markup element.
const split = page.indexOf('<div class="wrap">');
if (split < 0) throw new Error('Could not find <div class="wrap"> in index.html; update build-app.js');
const html = head + page.slice(0, split) + '</head>\n<body>\n' + page.slice(split) + '\n</body>\n</html>\n';
fs.writeFileSync(path.join(out, 'index.html'), html);
console.log('Built app/index.html with', FONTS.length, 'bundled fonts');
