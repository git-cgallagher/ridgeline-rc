// CI smoke check: the game's inline script must parse, and the desktop build must have its CSP and no Google Fonts links.
// Run after `npm run build:app` (npm run check does both).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = page.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('No inline <script> found in index.html');
new vm.Script(m[1], { filename: 'index.html' });

const app = fs.readFileSync(path.join(root, 'app', 'index.html'), 'utf8');
if (!app.includes('Content-Security-Policy')) throw new Error('app/index.html is missing its Content-Security-Policy');
if (/fonts\.(googleapis|gstatic)\.com/.test(app)) throw new Error('app/index.html still links Google Fonts');
for (const f of ['Silkscreen', 'Atkinson Hyperlegible']) if (!app.includes(`font-family: "${f}"`)) throw new Error(`app/index.html is missing bundled font ${f}`);
console.log('Game script parses; desktop page has its CSP and bundled fonts');
