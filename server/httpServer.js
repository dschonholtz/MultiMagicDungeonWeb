// Static file server for MultiMagicDungeonWeb
// Run: node server/httpServer.js
// Serves index.html and static assets from project root on port 3000

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseUrl } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PORT = parseInt(process.env.HTTP_PORT || '3000', 10);

const MIMES = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.gltf': 'model/gltf+json',
  '.glb':  'model/gltf-binary',
  '.md':   'text/plain',
};

// Resolve a URL pathname to a file path, checking ROOT then ROOT/public/ as fallback.
// Mirrors Vite's convention: files in public/ are served at the root URL path.
// If the resolved path is a directory, serves index.html inside it.
function resolveFile(pathname) {
  const rel  = pathname === '/' ? 'index.html' : pathname;

  function tryPath(base) {
    const full = path.join(base, rel);
    if (!full.startsWith(ROOT)) return null; // path traversal guard
    if (fs.existsSync(full)) {
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        const idx = path.join(full, 'index.html');
        return fs.existsSync(idx) ? idx : null;
      }
      return full;
    }
    return null;
  }

  return tryPath(ROOT) || tryPath(path.join(ROOT, 'public'));
}

http.createServer((req, res) => {
  const pathname = parseUrl(req.url).pathname;
  const file = resolveFile(pathname);
  if (!file) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ct = MIMES[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`HTTP server on http://localhost:${PORT}`));
